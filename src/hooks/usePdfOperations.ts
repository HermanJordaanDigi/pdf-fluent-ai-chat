
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

export const usePdfOperations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState<TranslatedDocument | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [isProcessingInsights, setIsProcessingInsights] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF file.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to translate PDFs.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Call the PDF translation webhook
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('user_id', user.id);

      const response = await fetch('https://jordaandigi.app.n8n.cloud/webhook-test/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      // Get the translated PDF blob
      const translatedBlob = await response.blob();
      const translatedDoc: TranslatedDocument = {
        filename: file.name.replace('.pdf', '_en.pdf'),
        size: `${(translatedBlob.size / 1024 / 1024).toFixed(2)} MB`,
        blob: translatedBlob
      };

      setTranslatedDoc(translatedDoc);

      // Save translation to database
      await supabase.from('translations').insert({
        user_id: user.id,
        original_filename: file.name,
        translated_filename: translatedDoc.filename,
        file_size: file.size,
        status: 'completed',
        summary: null,
        insights: null
      });

      toast({
        title: "Translation Complete",
        description: "Your PDF has been successfully translated to English."
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate this PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async (document?: TranslatedDocument) => {
    const docToUse = document || translatedDoc;
    if (!docToUse || !user) return;

    setIsProcessingSummary(true);
    console.log('Calling summary webhook...');
    
    try {
      // Convert blob to base64 for sending to webhook
      const arrayBuffer = await docToUse.blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch('https://jordaandigi.app.n8n.cloud/webhook-test/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: docToUse.filename,
          content: base64,
          user_id: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Summary response:', data);
      const summaryText = data.summary || data.text || data.result || "Summary generated successfully.";
      setSummary(summaryText);
      
      toast({
        title: "Summary Generated",
        description: "Document summary has been created."
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: "Summary Generation Failed",
        description: "Unable to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingSummary(false);
    }
  };

  const handleGenerateInsights = async (document?: TranslatedDocument) => {
    const docToUse = document || translatedDoc;
    if (!docToUse || !user) return;

    setIsProcessingInsights(true);
    console.log('Calling key-points webhook...');
    
    try {
      // Convert blob to base64 for sending to webhook
      const arrayBuffer = await docToUse.blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch('https://jordaandigi.app.n8n.cloud/webhook-test/key-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: docToUse.filename,
          content: base64,
          user_id: user.id
        }),
      });

      if (!response.ok) {
        throw new Error(`Insights generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Insights response:', data);
      // Handle different possible response formats
      const insightsArray = data.insights || data.key_points || data.points || data.result || [];
      const processedInsights = Array.isArray(insightsArray) ? insightsArray : [insightsArray];
      setInsights(processedInsights);
      
      toast({
        title: "Insights Generated",
        description: "Key insights have been extracted from your document."
      });
    } catch (error) {
      console.error('Insights generation error:', error);
      toast({
        title: "Insights Generation Failed",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingInsights(false);
    }
  };

  const handleDownload = () => {
    if (!translatedDoc) return;
    const url = URL.createObjectURL(translatedDoc.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = translatedDoc.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    uploadedFile,
    isUploading,
    translatedDoc,
    summary,
    insights,
    isProcessingSummary,
    isProcessingInsights,
    handleFileUpload,
    handleGenerateSummary,
    handleGenerateInsights,
    handleDownload
  };
};

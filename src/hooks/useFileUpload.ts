import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { TranslatedDocument } from '@/types/pdf';

export const useFileUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState<TranslatedDocument | null>(null);

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
      formData.append('PDF', file); // Fixed: Changed from 'pdf' to 'PDF' to match N8N expectation
      formData.append('user_id', user.id);

      console.log('Calling PDF translation webhook...');
      
      // Send to both webhooks in parallel
      const [translationResponse] = await Promise.all([
        fetch('https://jordaandigi.app.n8n.cloud/webhook-test/pdf', {
          method: 'POST',
          body: formData,
        }),
        fetch('https://jordaandigi.app.n8n.cloud/webhook/pdf-upload', {
          method: 'POST',
          body: formData,
        }).catch(err => console.log('Secondary webhook error (non-blocking):', err))
      ]);
      
      const response = translationResponse;

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

      console.log('PDF translation completed:', translatedDoc.filename);
      setTranslatedDoc(translatedDoc);

      // Save translation to database
      await (supabase.from('translations') as any).insert({
        user_id: user.id,
        file_name: file.name,
        target_language: 'English',
        status: 'completed'
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

  const clearResults = () => {
    setTranslatedDoc(null);
  };

  return {
    uploadedFile,
    isUploading,
    translatedDoc,
    handleFileUpload,
    handleDownload,
    clearResults
  };
};

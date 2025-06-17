import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/HeroSection';
import ToggleControls from '@/components/ToggleControls';
import TranslationResults from '@/components/TranslationResults';
import ChatInterface from '@/components/ChatInterface';
import TopNavigation from '@/components/TopNavigation';
import UserDashboard from '@/components/UserDashboard';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState<TranslatedDocument | null>(null);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [generateInsights, setGenerateInsights] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [isProcessingInsights, setIsProcessingInsights] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  if (authLoading) {
    return <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#333333]"></div>
      </div>;
  }

  // Add useEffect to handle toggle changes after upload
  useEffect(() => {
    if (translatedDoc && generateSummary && !summary && !isProcessingSummary) {
      handleGenerateSummary();
    }
  }, [generateSummary, translatedDoc]);

  useEffect(() => {
    if (translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights) {
      handleGenerateInsights();
    }
  }, [generateInsights, translatedDoc]);

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

  const initializeChat = () => {
    setChatMode(true);
    if (chatMessages.length === 0) {
      const systemMessage: ChatMessage = {
        id: 'system',
        content: "Ask me anything about your translated document.",
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([systemMessage]);
    }
  };

  if (chatMode) {
    return <ChatInterface 
      translatedDoc={translatedDoc} 
      chatMessages={chatMessages} 
      setChatMessages={setChatMessages} 
      onBack={() => setChatMode(false)} 
    />;
  }

  return <div className="min-h-screen bg-[#F5F0E1] flex flex-col">
      <TopNavigation 
        chatMode={chatMode} 
        onChatModeChange={initializeChat} 
        translatedDoc={translatedDoc} 
      />

      <div className="flex-1">
        <div className="container mx-auto max-w-4xl px-[16px] py-[16px] my-[6px]">
          <HeroSection onFileUpload={handleFileUpload} isUploading={isUploading} />
          <ToggleControls 
            generateSummary={generateSummary} 
            setGenerateSummary={setGenerateSummary} 
            generateInsights={generateInsights} 
            setGenerateInsights={setGenerateInsights} 
          />

          {translatedDoc && 
            <TranslationResults 
              translatedDoc={translatedDoc} 
              generateSummary={generateSummary} 
              generateInsights={generateInsights} 
              summary={summary} 
              insights={insights} 
              isProcessingSummary={isProcessingSummary} 
              isProcessingInsights={isProcessingInsights} 
              onDownload={handleDownload} 
            />
          }

          {user && !translatedDoc && <UserDashboard />}

          {/* Footer */}
          <footer className="mt-16 border-t border-[#DDDDDD] py-0 px-0 my-[71px]">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-4">
              <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">About</a>
              <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">Privacy Policy</a>
              <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">Contact</a>
            </div>
            <p className="text-center text-[#AAAAAA] text-sm">© 2025 ClaroDoc</p>
          </footer>
        </div>
      </div>
    </div>;
};

export default Index;

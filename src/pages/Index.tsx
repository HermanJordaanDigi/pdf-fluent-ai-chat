import React, { useState } from 'react';
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
import AnimatedBackground from '@/components/AnimatedBackground';

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
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

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
        <AnimatedBackground />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#333333]"></div>
      </div>;
  }
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
      // Simulate API call to Webhook A for translation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock translated document
      const translatedBlob = new Blob(['Mock translated PDF content'], {
        type: 'application/pdf'
      });
      const translatedDoc: TranslatedDocument = {
        filename: file.name.replace('.pdf', '_en.pdf'),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
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
        summary: generateSummary ? summary : null,
        insights: generateInsights ? insights : null
      });

      // Process summary and insights if toggles are active
      if (generateSummary) {
        handleGenerateSummary();
      }
      if (generateInsights) {
        handleGenerateInsights();
      }
      toast({
        title: "Translation Complete",
        description: "Your PDF has been successfully translated to English."
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Unable to translate this PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleGenerateSummary = async () => {
    setIsProcessingSummary(true);
    try {
      // Simulate API call to Webhook B
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSummary("This document discusses the implementation of artificial intelligence in modern business processes. It covers key strategies for digital transformation, including workflow automation, data analysis, and customer experience enhancement. The document emphasizes the importance of gradual implementation and employee training to ensure successful AI adoption.");
    } catch (error) {
      toast({
        title: "Summary Generation Failed",
        description: "Unable to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingSummary(false);
    }
  };
  const handleGenerateInsights = async () => {
    setIsProcessingInsights(true);
    try {
      // Simulate API call to Webhook C
      await new Promise(resolve => setTimeout(resolve, 2000));
      setInsights(["AI implementation requires careful planning and stakeholder buy-in", "Workflow automation can reduce operational costs by up to 30%", "Employee training is crucial for successful digital transformation", "Data quality directly impacts AI system effectiveness", "Gradual implementation reduces risk and improves adoption rates"]);
    } catch (error) {
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
    return (
      <>
        <AnimatedBackground />
        <ChatInterface translatedDoc={translatedDoc} chatMessages={chatMessages} setChatMessages={setChatMessages} onBack={() => setChatMode(false)} />
      </>
    );
  }
  return (
    <div className="min-h-screen bg-[#F5F0E1] flex flex-col relative">
      <AnimatedBackground />
      
      <TopNavigation chatMode={chatMode} onChatModeChange={initializeChat} translatedDoc={translatedDoc} />

      <div className="flex-1 relative z-10">
        <div className="container mx-auto max-w-4xl px-[16px] py-[16px] my-[6px]">
          <HeroSection onFileUpload={handleFileUpload} isUploading={isUploading} />
          <ToggleControls generateSummary={generateSummary} setGenerateSummary={setGenerateSummary} generateInsights={generateInsights} setGenerateInsights={setGenerateInsights} />

          {translatedDoc && <TranslationResults translatedDoc={translatedDoc} generateSummary={generateSummary} generateInsights={generateInsights} summary={summary} insights={insights} isProcessingSummary={isProcessingSummary} isProcessingInsights={isProcessingInsights} onDownload={handleDownload} />}

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
    </div>
  );
};

export default Index;

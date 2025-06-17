
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatInterface from '@/components/ChatInterface';
import TopNavigation from '@/components/TopNavigation';
import MainContent from '@/components/MainContent';
import { usePdfOperations } from '@/hooks/usePdfOperations';
import { useChatMode } from '@/hooks/useChatMode';
import { useAutoGenerate } from '@/hooks/useAutoGenerate';

const Index = () => {
  const { loading: authLoading } = useAuth();

  // PDF operations state and handlers
  const {
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
  } = usePdfOperations();

  // Chat mode state and handlers
  const {
    chatMode,
    chatMessages,
    setChatMessages,
    initializeChat,
    setChatMode
  } = useChatMode();

  // Toggle controls state
  const [generateSummary, setGenerateSummary] = useState(false);
  const [generateInsights, setGenerateInsights] = useState(false);

  // Auto-generate summary and insights when toggles are enabled
  useAutoGenerate({
    translatedDoc,
    generateSummary,
    generateInsights,
    summary,
    insights,
    isProcessingSummary,
    isProcessingInsights,
    handleGenerateSummary,
    handleGenerateInsights
  });

  if (authLoading) {
    return <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#333333]"></div>
      </div>;
  }

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
        <MainContent 
          generateSummary={generateSummary}
          setGenerateSummary={setGenerateSummary}
          generateInsights={generateInsights}
          setGenerateInsights={setGenerateInsights}
          translatedDoc={translatedDoc}
          summary={summary}
          insights={insights}
          isProcessingSummary={isProcessingSummary}
          isProcessingInsights={isProcessingInsights}
          isUploading={isUploading}
          onFileUpload={handleFileUpload}
          onDownload={handleDownload}
        />
      </div>
    </div>;
};

export default Index;

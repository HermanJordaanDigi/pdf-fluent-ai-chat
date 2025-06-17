
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from '@/components/HeroSection';
import ToggleControls from '@/components/ToggleControls';
import TranslationResults from '@/components/TranslationResults';
import UserDashboard from '@/components/UserDashboard';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface MainContentProps {
  generateSummary: boolean;
  setGenerateSummary: (value: boolean) => void;
  generateInsights: boolean;
  setGenerateInsights: (value: boolean) => void;
  translatedDoc: TranslatedDocument | null;
  summary: string;
  insights: string[];
  isProcessingSummary: boolean;
  isProcessingInsights: boolean;
  isUploading: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onDownload: () => void;
}

const MainContent = ({
  generateSummary,
  setGenerateSummary,
  generateInsights,
  setGenerateInsights,
  translatedDoc,
  summary,
  insights,
  isProcessingSummary,
  isProcessingInsights,
  isUploading,
  onFileUpload,
  onDownload
}: MainContentProps) => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto max-w-4xl px-[16px] py-[16px] my-[6px]">
      <HeroSection onFileUpload={onFileUpload} isUploading={isUploading} />
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
          onDownload={onDownload} 
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
  );
};

export default MainContent;

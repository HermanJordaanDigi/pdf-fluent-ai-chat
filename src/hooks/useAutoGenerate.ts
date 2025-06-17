
import { useEffect } from 'react';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface UseAutoGenerateProps {
  translatedDoc: TranslatedDocument | null;
  generateSummary: boolean;
  generateInsights: boolean;
  summary: string;
  insights: string[];
  isProcessingSummary: boolean;
  isProcessingInsights: boolean;
  handleGenerateSummary: () => Promise<void>;
  handleGenerateInsights: () => Promise<void>;
}

export const useAutoGenerate = ({
  translatedDoc,
  generateSummary,
  generateInsights,
  summary,
  insights,
  isProcessingSummary,
  isProcessingInsights,
  handleGenerateSummary,
  handleGenerateInsights
}: UseAutoGenerateProps) => {
  // Auto-generate summary when toggle is enabled
  useEffect(() => {
    console.log('Summary effect triggered:', {
      translatedDoc: !!translatedDoc,
      generateSummary,
      summary: !!summary,
      isProcessingSummary
    });
    
    if (translatedDoc && generateSummary && !summary && !isProcessingSummary) {
      console.log('Calling handleGenerateSummary...');
      handleGenerateSummary();
    }
  }, [generateSummary, translatedDoc, summary, isProcessingSummary, handleGenerateSummary]);

  // Auto-generate insights when toggle is enabled
  useEffect(() => {
    console.log('Insights effect triggered:', {
      translatedDoc: !!translatedDoc,
      generateInsights,
      insightsLength: insights.length,
      isProcessingInsights
    });
    
    if (translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights) {
      console.log('Calling handleGenerateInsights...');
      handleGenerateInsights();
    }
  }, [generateInsights, translatedDoc, insights, isProcessingInsights, handleGenerateInsights]);
};

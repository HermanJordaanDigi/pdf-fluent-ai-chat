
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
    console.log('Summary auto-generation check:', {
      hasTranslatedDoc: !!translatedDoc,
      generateSummary,
      hasSummary: !!summary,
      isProcessingSummary,
      shouldGenerate: translatedDoc && generateSummary && !summary && !isProcessingSummary
    });
    
    if (translatedDoc && generateSummary && !summary && !isProcessingSummary) {
      console.log('Auto-generating summary...');
      handleGenerateSummary().catch(error => {
        console.error('Auto-generation failed for summary:', error);
      });
    }
  }, [translatedDoc, generateSummary, summary, isProcessingSummary, handleGenerateSummary]);

  // Auto-generate insights when toggle is enabled
  useEffect(() => {
    console.log('Insights auto-generation check:', {
      hasTranslatedDoc: !!translatedDoc,
      generateInsights,
      hasInsights: insights.length > 0,
      isProcessingInsights,
      shouldGenerate: translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights
    });
    
    if (translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights) {
      console.log('Auto-generating insights...');
      handleGenerateInsights().catch(error => {
        console.error('Auto-generation failed for insights:', error);
      });
    }
  }, [translatedDoc, generateInsights, insights.length, isProcessingInsights, handleGenerateInsights]);
};

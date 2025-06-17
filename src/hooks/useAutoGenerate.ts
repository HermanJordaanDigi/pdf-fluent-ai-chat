
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
    if (translatedDoc && generateSummary && !summary && !isProcessingSummary) {
      handleGenerateSummary();
    }
  }, [generateSummary, translatedDoc, summary, isProcessingSummary, handleGenerateSummary]);

  // Auto-generate insights when toggle is enabled
  useEffect(() => {
    if (translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights) {
      handleGenerateInsights();
    }
  }, [generateInsights, translatedDoc, insights, isProcessingInsights, handleGenerateInsights]);
};


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
    console.log('=== SUMMARY AUTO-GENERATION DEBUG ===');
    console.log('translatedDoc exists:', !!translatedDoc);
    console.log('generateSummary:', generateSummary);
    console.log('summary exists:', !!summary);
    console.log('summary length:', summary.length);
    console.log('isProcessingSummary:', isProcessingSummary);
    
    const shouldGenerate = translatedDoc && generateSummary && !summary && !isProcessingSummary;
    console.log('Should generate summary:', shouldGenerate);
    
    if (shouldGenerate) {
      console.log('🚀 CALLING handleGenerateSummary...');
      handleGenerateSummary().catch(error => {
        console.error('❌ Auto-generation failed for summary:', error);
      });
    }
  }, [translatedDoc, generateSummary, summary, isProcessingSummary]);

  // Auto-generate insights when toggle is enabled
  useEffect(() => {
    console.log('=== INSIGHTS AUTO-GENERATION DEBUG ===');
    console.log('translatedDoc exists:', !!translatedDoc);
    console.log('generateInsights:', generateInsights);
    console.log('insights exists:', insights.length > 0);
    console.log('insights count:', insights.length);
    console.log('isProcessingInsights:', isProcessingInsights);
    
    const shouldGenerate = translatedDoc && generateInsights && insights.length === 0 && !isProcessingInsights;
    console.log('Should generate insights:', shouldGenerate);
    
    if (shouldGenerate) {
      console.log('🚀 CALLING handleGenerateInsights...');
      handleGenerateInsights().catch(error => {
        console.error('❌ Auto-generation failed for insights:', error);
      });
    }
  }, [translatedDoc, generateInsights, insights.length, isProcessingInsights]);
};

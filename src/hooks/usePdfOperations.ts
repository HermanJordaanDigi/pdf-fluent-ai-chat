
import { useFileUpload } from './useFileUpload';
import { useSummaryGeneration } from './useSummaryGeneration';
import { useInsightsGeneration } from './useInsightsGeneration';

export const usePdfOperations = () => {
  const {
    uploadedFile,
    isUploading,
    translatedDoc,
    handleFileUpload,
    handleDownload,
    clearResults
  } = useFileUpload();

  const {
    summary,
    isProcessingSummary,
    handleGenerateSummary: generateSummary,
    clearSummary
  } = useSummaryGeneration();

  const {
    insights,
    isProcessingInsights,
    handleGenerateInsights: generateInsights,
    clearInsights
  } = useInsightsGeneration();

  const handleGenerateSummary = () => generateSummary(translatedDoc);
  const handleGenerateInsights = () => generateInsights(translatedDoc);

  // Clear all results when uploading new file
  const handleFileUploadWithClear = async (file: File) => {
    clearSummary();
    clearInsights();
    clearResults();
    await handleFileUpload(file);
  };

  return {
    uploadedFile,
    isUploading,
    translatedDoc,
    summary,
    insights,
    isProcessingSummary,
    isProcessingInsights,
    handleFileUpload: handleFileUploadWithClear,
    handleGenerateSummary,
    handleGenerateInsights,
    handleDownload
  };
};

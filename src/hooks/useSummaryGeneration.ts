
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { TranslatedDocument } from '@/types/pdf';

export const useSummaryGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [summary, setSummary] = useState<string>("");
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);

  const handleGenerateSummary = async (translatedDoc: TranslatedDocument | null) => {
    if (!user) {
      console.log('Cannot generate summary - no user');
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate summaries.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingSummary(true);
    console.log('🚀 Calling summary webhook with GET...');
    
    try {
      // Construct URL with query parameters
      const params = new URLSearchParams({
        user_id: user.id,
        filename: translatedDoc ? translatedDoc.filename : 'test-document.pdf'
      });

      const url = `https://jordaandigi.app.n8n.cloud/webhook-test/summary?${params.toString()}`;
      console.log('Summary URL:', url);

      const response = await fetch(url, {
        method: 'GET',
      });

      console.log('Summary response status:', response.status);

      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.status} ${response.statusText}`);
      }

      // Wait for the response and parse it
      const data = await response.json();
      console.log('Summary response data:', data);
      
      // Extract summary text from various possible response formats
      const summaryText = data.summary || data.text || data.result || data.content || "Summary generated successfully.";
      
      // Set the summary text to state
      setSummary(summaryText);
      
      toast({
        title: "Summary Generated",
        description: "Document summary has been created."
      });
    } catch (error) {
      console.error('❌ Summary generation error:', error);
      toast({
        title: "Summary Generation Failed",
        description: `Unable to generate summary: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessingSummary(false);
    }
  };

  const clearSummary = () => {
    setSummary("");
  };

  return {
    summary,
    isProcessingSummary,
    handleGenerateSummary,
    clearSummary
  };
};

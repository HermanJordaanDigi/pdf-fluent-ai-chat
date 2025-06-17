
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
      console.log('🔍 Full webhook response:', data);
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Response keys:', Object.keys(data));
      
      // Try multiple parsing strategies to extract the summary text
      let summaryText = "";
      
      // Strategy 1: Direct field access
      if (data.summary && typeof data.summary === 'string') {
        summaryText = data.summary;
        console.log('✅ Found summary in data.summary');
      }
      // Strategy 2: Other common field names
      else if (data.text && typeof data.text === 'string') {
        summaryText = data.text;
        console.log('✅ Found summary in data.text');
      }
      else if (data.result && typeof data.result === 'string') {
        summaryText = data.result;
        console.log('✅ Found summary in data.result');
      }
      else if (data.content && typeof data.content === 'string') {
        summaryText = data.content;
        console.log('✅ Found summary in data.content');
      }
      else if (data.message && typeof data.message === 'string') {
        summaryText = data.message;
        console.log('✅ Found summary in data.message');
      }
      // Strategy 3: If data itself is a string
      else if (typeof data === 'string') {
        summaryText = data;
        console.log('✅ Response data is directly a string');
      }
      // Strategy 4: Try to find any string value in the response
      else {
        const stringValues = Object.values(data).filter(value => typeof value === 'string' && value.length > 10);
        if (stringValues.length > 0) {
          summaryText = stringValues[0] as string;
          console.log('✅ Found summary in first long string value');
        } else {
          console.log('❌ No suitable summary text found in response');
          summaryText = "Summary received but could not extract text. Check console for details.";
        }
      }
      
      console.log('📝 Final summary text:', summaryText);
      
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

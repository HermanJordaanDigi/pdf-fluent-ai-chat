
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { TranslatedDocument } from '@/types/pdf';

export const useInsightsGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [insights, setInsights] = useState<string>(''); // Changed from string[] to string
  const [isProcessingInsights, setIsProcessingInsights] = useState(false);

  const handleGenerateInsights = async (translatedDoc: TranslatedDocument | null) => {
    if (!user) {
      console.log('Cannot generate insights - no user');
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate insights.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingInsights(true);
    console.log('🚀 Calling insights webhook with GET...');
    
    try {
      // Construct URL with query parameters
      const params = new URLSearchParams({
        user_id: user.id,
        filename: translatedDoc ? translatedDoc.filename : 'test-document.pdf'
      });

      const url = `https://jordaandigi.app.n8n.cloud/webhook-test/key-points?${params.toString()}`;
      console.log('Insights URL:', url);

      const response = await fetch(url, {
        method: 'GET',
      });

      console.log('Insights response status:', response.status);

      if (!response.ok) {
        throw new Error(`Insights generation failed: ${response.status} ${response.statusText}`);
      }

      // Wait for the response and parse it
      const data = await response.json();
      console.log('🔍 Full webhook response:', data);
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Response keys:', Array.isArray(data) ? 'Array with length:' + data.length : Object.keys(data));
      
      // Try multiple parsing strategies to extract insights
      let insightsText = "";
      
      // Strategy 1: Handle specific array format [{"insights": "markdown text"}]
      if (Array.isArray(data) && data.length > 0 && data[0].insights) {
        insightsText = data[0].insights;
        console.log('✅ Found insights string in array format');
      }
      // Strategy 2: Direct field access
      else if (data.insights && typeof data.insights === 'string') {
        insightsText = data.insights;
        console.log('✅ Found insights in data.insights');
      }
      // Strategy 3: Other common field names
      else if (data.text && typeof data.text === 'string') {
        insightsText = data.text;
        console.log('✅ Found insights in data.text');
      }
      else if (data.result && typeof data.result === 'string') {
        insightsText = data.result;
        console.log('✅ Found insights in data.result');
      }
      else if (data.content && typeof data.content === 'string') {
        insightsText = data.content;
        console.log('✅ Found insights in data.content');
      }
      else if (typeof data === 'string') {
        insightsText = data;
        console.log('✅ Response data is directly a string');
      }
      else {
        const stringValues = Object.values(data).filter(value => typeof value === 'string' && value.length > 10);
        if (stringValues.length > 0) {
          insightsText = stringValues[0] as string;
          console.log('✅ Found insights in first long string value');
        }
      }
      
      console.log('📝 Raw insights text:', insightsText);
      
      if (!insightsText || insightsText.trim().length === 0) {
        console.error('❌ No insights were extracted from the response');
        insightsText = "No insights could be extracted from the response. Please try again.";
      }
      
      // Set the insights as a single markdown string
      setInsights(insightsText.trim());
      
      toast({
        title: "Insights Generated",
        description: "Key insights have been extracted and are ready to view."
      });
    } catch (error) {
      console.error('❌ Insights generation error:', error);
      toast({
        title: "Insights Generation Failed",
        description: `Unable to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessingInsights(false);
    }
  };

  const clearInsights = () => {
    setInsights('');
  };

  return {
    insights,
    isProcessingInsights,
    handleGenerateInsights,
    clearInsights
  };
};

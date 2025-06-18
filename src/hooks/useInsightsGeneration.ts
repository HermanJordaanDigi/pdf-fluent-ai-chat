
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { TranslatedDocument } from '@/types/pdf';

export const useInsightsGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [insights, setInsights] = useState<string[]>([]);
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
      
      // Parse the markdown text to extract individual insights
      let insightsArray: string[] = [];
      
      if (insightsText) {
        // Look for numbered insights in the markdown
        // Match patterns like "1. **Title**: content" or "1. **Title** - content"
        const numberedInsights = insightsText.match(/\d+\.\s*\*\*[^*]+\*\*[:\-]?\s*[^0-9]+?(?=\d+\.\s*\*\*|$)/g);
        
        if (numberedInsights && numberedInsights.length > 0) {
          insightsArray = numberedInsights.map(insight => insight.trim());
          console.log('✅ Successfully parsed numbered insights:', insightsArray.length);
        } else {
          // Try alternative parsing - split by numbers followed by periods
          const splitByNumbers = insightsText.split(/\d+\.\s+/).filter(part => part.trim().length > 20);
          if (splitByNumbers.length > 1) {
            insightsArray = splitByNumbers.map(insight => insight.trim());
            console.log('✅ Successfully split by numbers:', insightsArray.length);
          } else {
            // Fallback: treat the entire text as one insight
            insightsArray = [insightsText.trim()];
            console.log('✅ Using entire text as single insight');
          }
        }
      }
      
      console.log('📝 Final insights array:', insightsArray);
      console.log('📝 Final insights count:', insightsArray.length);
      
      // Verify each insight and log them
      insightsArray.forEach((insight, index) => {
        console.log(`📝 Final insight ${index + 1} (${insight.length} chars):`, insight.substring(0, 200) + (insight.length > 200 ? '...' : ''));
      });
      
      if (insightsArray.length === 0) {
        console.error('❌ No insights were extracted from the response');
        insightsArray = ["No insights could be extracted from the response. Please try again."];
      }
      
      setInsights(insightsArray);
      
      toast({
        title: "Insights Generated",
        description: `${insightsArray.length} key insights have been extracted.`
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
    setInsights([]);
  };

  return {
    insights,
    isProcessingInsights,
    handleGenerateInsights,
    clearInsights
  };
};

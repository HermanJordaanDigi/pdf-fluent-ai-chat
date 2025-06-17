
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
      let insightsArray: string[] = [];
      
      // Strategy 1: Handle array format like [{"insights": "{\"Insight1\":\"text\"}"}]
      if (Array.isArray(data) && data.length > 0 && data[0].insights) {
        try {
          const insightsString = data[0].insights;
          console.log('🔍 Found insights string:', insightsString);
          
          // Parse the JSON string inside the insights field
          const insightsObject = JSON.parse(insightsString);
          console.log('🔍 Parsed insights object:', insightsObject);
          
          // Extract values from the insights object
          insightsArray = Object.values(insightsObject).filter(value => typeof value === 'string');
          console.log('✅ Found insights in array format with JSON string parsing');
        } catch (parseError) {
          console.log('❌ Error parsing insights JSON string:', parseError);
          // Fall back to treating it as a regular string
          insightsArray = [data[0].insights];
        }
      }
      // Strategy 2: Direct array field access
      else if (data.insights && Array.isArray(data.insights)) {
        insightsArray = data.insights;
        console.log('✅ Found insights in data.insights array');
      }
      else if (data.key_points && Array.isArray(data.key_points)) {
        insightsArray = data.key_points;
        console.log('✅ Found insights in data.key_points array');
      }
      else if (data.points && Array.isArray(data.points)) {
        insightsArray = data.points;
        console.log('✅ Found insights in data.points array');
      }
      else if (data.result && Array.isArray(data.result)) {
        insightsArray = data.result;
        console.log('✅ Found insights in data.result array');
      }
      else if (data.content && Array.isArray(data.content)) {
        insightsArray = data.content;
        console.log('✅ Found insights in data.content array');
      }
      // Strategy 3: If the response is directly an array
      else if (Array.isArray(data)) {
        insightsArray = data;
        console.log('✅ Response data is directly an array');
      }
      // Strategy 4: Try to convert string responses to array (split by newlines, bullets, etc.)
      else if (typeof data === 'string') {
        insightsArray = data.split('\n').filter(line => line.trim().length > 0);
        console.log('✅ Converted string response to array by splitting lines');
      }
      else if (data.insights && typeof data.insights === 'string') {
        insightsArray = data.insights.split('\n').filter(line => line.trim().length > 0);
        console.log('✅ Converted string insights to array');
      }
      else if (data.key_points && typeof data.key_points === 'string') {
        insightsArray = data.key_points.split('\n').filter(line => line.trim().length > 0);
        console.log('✅ Converted string key_points to array');
      }
      // Strategy 5: Look for any string values and try to parse them
      else {
        const stringValues = Object.values(data).filter(value => typeof value === 'string' && value.length > 10);
        if (stringValues.length > 0) {
          insightsArray = (stringValues[0] as string).split('\n').filter(line => line.trim().length > 0);
          console.log('✅ Found insights by parsing first long string value');
        } else {
          console.log('❌ No suitable insights found in response');
          insightsArray = ["Insights received but could not extract content. Check console for details."];
        }
      }
      
      // Clean up the insights array
      insightsArray = insightsArray
        .map(insight => insight.trim())
        .filter(insight => insight.length > 0)
        .map(insight => insight.replace(/^[-•*]\s*/, '')); // Remove bullet points
      
      console.log('📝 Final insights array:', insightsArray);
      
      // Set the insights array to state
      setInsights(insightsArray);
      
      toast({
        title: "Insights Generated",
        description: "Key insights have been extracted."
      });
    } catch (error) {
      console.error('❌ Insights generation error:', error);
      toast({
        title: "Insights Generation Failed",
        description: `Unable to generate insights: ${error.message}`,
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

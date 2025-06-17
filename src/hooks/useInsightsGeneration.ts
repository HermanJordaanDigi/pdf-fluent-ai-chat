
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
      console.log('Insights response data:', data);
      
      // Extract insights array from various possible response formats
      const insightsArray = data.insights || data.key_points || data.points || data.result || data.content || [];
      
      // Ensure we have an array and process it
      const processedInsights = Array.isArray(insightsArray) ? insightsArray : [insightsArray].filter(Boolean);
      
      // Set the insights array to state
      setInsights(processedInsights);
      
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

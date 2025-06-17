
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, Lightbulb } from 'lucide-react';

interface ToggleControlsProps {
  generateSummary: boolean;
  setGenerateSummary: (value: boolean) => void;
  generateInsights: boolean;
  setGenerateInsights: (value: boolean) => void;
}

const ToggleControls = ({ 
  generateSummary, 
  setGenerateSummary, 
  generateInsights, 
  setGenerateInsights 
}: ToggleControlsProps) => {
  return (
    <Card className="mb-8 shadow-xl border-white/30 bg-white/25 backdrop-blur-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <Switch 
              id="summary" 
              checked={generateSummary} 
              onCheckedChange={setGenerateSummary} 
              className="data-[state=checked]:bg-[#DDDDDD]" 
            />
            <FileText className="h-4 w-4 text-[#333333]" />
            <label htmlFor="summary" className="text-sm text-[#333333] cursor-pointer">
              Generate Summary
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="insights" 
              checked={generateInsights} 
              onCheckedChange={setGenerateInsights} 
              className="data-[state=checked]:bg-[#DDDDDD]" 
            />
            <Lightbulb className="h-4 w-4 text-[#333333]" />
            <label htmlFor="insights" className="text-sm text-[#333333] cursor-pointer">
              Generate 5 Key Insights
            </label>
          </div>
        </div>

        {!generateSummary && !generateInsights && (
          <p className="text-[#666666] text-sm text-center mt-4">
            Select one or both options after uploading
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ToggleControls;

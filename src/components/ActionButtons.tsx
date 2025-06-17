
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Lightbulb } from 'lucide-react';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface ActionButtonsProps {
  translatedDoc: TranslatedDocument | null;
  onGenerateSummary: () => Promise<void>;
  onGenerateInsights: () => Promise<void>;
  isProcessingSummary: boolean;
  isProcessingInsights: boolean;
}

const ActionButtons = ({ 
  translatedDoc,
  onGenerateSummary,
  onGenerateInsights,
  isProcessingSummary,
  isProcessingInsights
}: ActionButtonsProps) => {
  const isDisabled = !translatedDoc;

  return (
    <Card className="mb-8 shadow-xl border-white/30 bg-white/25 backdrop-blur-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onGenerateSummary}
            disabled={isDisabled || isProcessingSummary}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-[#333333] border border-white/40 text-[#333333] flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Summary
          </Button>
          
          <Button
            onClick={onGenerateInsights}
            disabled={isDisabled || isProcessingInsights}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-[#333333] border border-white/40 text-[#333333] flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Generate 5 Key Insights
          </Button>
        </div>

        {isDisabled && (
          <p className="text-[#999999] text-sm text-center mt-4">
            Upload and translate a PDF first to enable these options
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ActionButtons;

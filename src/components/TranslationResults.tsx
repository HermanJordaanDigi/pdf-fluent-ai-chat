
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface TranslationResultsProps {
  translatedDoc: TranslatedDocument;
  generateSummary: boolean;
  generateInsights: boolean;
  summary: string;
  insights: string[];
  isProcessingSummary: boolean;
  isProcessingInsights: boolean;
  onDownload: () => void;
}

const TranslationResults = ({
  translatedDoc,
  generateSummary,
  generateInsights,
  summary,
  insights,
  isProcessingSummary,
  isProcessingInsights,
  onDownload
}: TranslationResultsProps) => {
  return (
    <div className="space-y-6">
      {/* Translated PDF Download */}
      <Card className="shadow-xl border-white/30 bg-white/25 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Translated PDF Ready
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[#333333] font-medium">{translatedDoc.filename}</p>
              <p className="text-[#666666] text-sm">{translatedDoc.size}</p>
            </div>
            <Button 
              onClick={onDownload} 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:text-[#333333] border border-white/40 text-[#333333]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Translated PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {generateSummary && (
        <Card className="shadow-xl border-white/30 bg-white/25 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg text-[#333333]">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessingSummary ? (
              <div className="bg-white/20 animate-pulse rounded-lg h-32"></div>
            ) : summary ? (
              <div className="bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-[#333333] leading-relaxed">{summary}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Key Insights Section */}
      {generateInsights && (
        <Card className="shadow-xl border-white/30 bg-white/25 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-lg text-[#333333]">5 Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessingInsights ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white/20 animate-pulse rounded h-8"></div>
                ))}
              </div>
            ) : insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#888888] rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-[#333333] leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationResults;

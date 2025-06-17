
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Upload } from 'lucide-react';

interface HeroSectionProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const HeroSection = ({ onFileUpload, isUploading }: HeroSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl font-bold mb-2 px-2">
          <TextShimmerWave
            as="h1"
            className="[--base-color:#333333] [--base-gradient-color:#666666]"
            duration={1.2}
            spread={1.5}
            zDistance={8}
            scaleDistance={1.05}
            rotateYDistance={15}
          >
            Translate Your PDFs from Portuguese to English Instantly
          </TextShimmerWave>
        </CardTitle>
        <CardDescription className="text-[#666666] px-2">
          Just upload your document to get an English version - plus summaries and AI chat support.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-[10px] px-[2px] my-0">
        <div 
          onDragOver={handleDragOver} 
          onDrop={handleDrop} 
          className="border-2 border-dashed border-[#CCCCCC] rounded-lg p-8 text-center mb-6 transition-colors hover:border-[#AAAAAA] mx-[6px]"
        >
          <Upload className="h-8 w-8 text-[#333333] mx-auto mb-4" />
          <p className="text-[#333333] mb-4">
            Drop PDF here or click to browse
          </p>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".pdf" 
            onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])} 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading} 
            className="bg-[#AAAAAA] hover:bg-white hover:text-[#333333] border border-[#AAAAAA]"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-xs text-[#AAAAAA] text-center">Powered by AI</p>
      </CardContent>
    </Card>
  );
};

export default HeroSection;

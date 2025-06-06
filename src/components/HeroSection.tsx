
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

const HeroSection = () => {
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold mb-2">
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
        <CardDescription className="text-[#666666]">
          Upload a PDF → Download translated version → Summarize or Chat
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default HeroSection;

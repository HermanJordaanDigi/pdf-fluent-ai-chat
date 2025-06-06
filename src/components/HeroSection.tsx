
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HeroSection = () => {
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#333333] mb-2">
          Translate Your PDFs from Portuguese to English Instantly
        </CardTitle>
        <CardDescription className="text-[#666666]">
          Upload a PDF → Download translated version → Summarize or Chat
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default HeroSection;

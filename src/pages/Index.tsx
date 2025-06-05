
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Lightbulb, MessageCircle, ArrowLeft, Send, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState<TranslatedDocument | null>(null);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [generateInsights, setGenerateInsights] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [insights, setInsights] = useState<string[]>([]);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);
  const [isProcessingInsights, setIsProcessingInsights] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Simulate API call to Webhook A for translation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock translated document
      const translatedBlob = new Blob(['Mock translated PDF content'], { type: 'application/pdf' });
      const translatedDoc: TranslatedDocument = {
        filename: file.name.replace('.pdf', '_en.pdf'),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        blob: translatedBlob
      };
      
      setTranslatedDoc(translatedDoc);
      
      // Process summary and insights if toggles are active
      if (generateSummary) {
        handleGenerateSummary();
      }
      if (generateInsights) {
        handleGenerateInsights();
      }

      toast({
        title: "Translation Complete",
        description: "Your PDF has been successfully translated to English.",
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Unable to translate this PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsProcessingSummary(true);
    try {
      // Simulate API call to Webhook B
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSummary("This document discusses the implementation of artificial intelligence in modern business processes. It covers key strategies for digital transformation, including workflow automation, data analysis, and customer experience enhancement. The document emphasizes the importance of gradual implementation and employee training to ensure successful AI adoption.");
    } catch (error) {
      toast({
        title: "Summary Generation Failed",
        description: "Unable to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingSummary(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsProcessingInsights(true);
    try {
      // Simulate API call to Webhook C
      await new Promise(resolve => setTimeout(resolve, 2000));
      setInsights([
        "AI implementation requires careful planning and stakeholder buy-in",
        "Workflow automation can reduce operational costs by up to 30%",
        "Employee training is crucial for successful digital transformation",
        "Data quality directly impacts AI system effectiveness",
        "Gradual implementation reduces risk and improves adoption rates"
      ]);
    } catch (error) {
      toast({
        title: "Insights Generation Failed",
        description: "Unable to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingInsights(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !translatedDoc) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsSendingMessage(true);

    try {
      // Simulate API call to Webhook D
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Based on your translated document, I can help you understand the key concepts. Your question about "${chatInput}" relates to the document's discussion of AI implementation strategies and best practices for digital transformation.`,
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDownload = () => {
    if (!translatedDoc) return;
    
    const url = URL.createObjectURL(translatedDoc.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = translatedDoc.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const initializeChat = () => {
    setChatMode(true);
    if (chatMessages.length === 0) {
      const systemMessage: ChatMessage = {
        id: 'system',
        content: "Ask me anything about your translated document.",
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([systemMessage]);
    }
  };

  if (chatMode) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex flex-col">
        {/* Chat Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setChatMode(false)}
              className="text-[#333333] hover:bg-[#EEEEEE] p-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Translation
            </Button>
            <h2 className="text-lg font-medium text-[#333333]">
              {translatedDoc?.filename || "Document Chat"}
            </h2>
            <div></div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                    message.isUser
                      ? 'bg-[#CCCCCC] text-[#333333]'
                      : message.id === 'system'
                      ? 'bg-[#EEEEEE] text-[#666666] text-center'
                      : 'bg-white text-[#333333]'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about your document..."
              className="flex-1 border-[#CCCCCC] focus:border-[#AAAAAA]"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isSendingMessage}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isSendingMessage}
              className="bg-[#AAAAAA] hover:bg-white hover:text-[#333333] border border-[#AAAAAA]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E1] relative">
      {/* Chat Mode Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
          <MessageCircle className="h-4 w-4 text-[#333333]" />
          <span className="text-sm text-[#333333]">Chat Mode</span>
          <Switch
            checked={chatMode}
            onCheckedChange={initializeChat}
            disabled={!translatedDoc}
            className="data-[state=checked]:bg-[#AAAAAA]"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#333333] mb-2">
              Translate Your PDFs from Portuguese to English Instantly
            </CardTitle>
            <CardDescription className="text-[#666666]">
              Upload a PDF → Download translated version → Summarize or Chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-[#CCCCCC] rounded-lg p-8 text-center mb-6 transition-colors hover:border-[#AAAAAA]"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-[#333333] mx-auto mb-4" />
              <p className="text-[#333333] mb-4">
                Drop PDF here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
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

            {/* Powered by Note */}
            <p className="text-xs text-[#AAAAAA] text-center">Powered by n8n</p>
          </CardContent>
        </Card>

        {/* Toggle Controls */}
        <Card className="mb-8 shadow-lg border-0">
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
              <p className="text-[#777777] text-sm text-center mt-4">
                Select one or both options after uploading
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results Area */}
        {translatedDoc && (
          <div className="space-y-6">
            {/* Translated PDF Download */}
            <Card className="shadow-lg border-0">
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
                    <p className="text-[#777777] text-sm">{translatedDoc.size}</p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="bg-[#AAAAAA] hover:bg-white hover:text-[#333333] border border-[#AAAAAA]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Translated PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary Section */}
            {generateSummary && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-[#333333]">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {isProcessingSummary ? (
                    <div className="bg-[#EEEEEE] animate-pulse rounded-lg h-32"></div>
                  ) : summary ? (
                    <div className="bg-[#FAFAFA] border border-[#CCCCCC] rounded-lg p-4 max-h-48 overflow-y-auto">
                      <p className="text-[#333333] leading-relaxed">{summary}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {/* Key Insights Section */}
            {generateInsights && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-[#333333]">5 Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  {isProcessingInsights ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-[#EEEEEE] animate-pulse rounded h-8"></div>
                      ))}
                    </div>
                  ) : insights.length > 0 ? (
                    <ul className="space-y-3">
                      {insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-[#AAAAAA] rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-[#333333] leading-relaxed">{insight}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-[#DDDDDD]">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-4">
            <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">About</a>
            <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">Privacy Policy</a>
            <a href="#" className="text-[#777777] hover:text-[#333333] transition-colors">Contact</a>
          </div>
          <p className="text-center text-[#AAAAAA] text-sm">© 2025 YourCompanyName</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

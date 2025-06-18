import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface TranslatedDocument {
  filename: string;
  size: string;
  blob: Blob;
}

interface ChatInterfaceProps {
  translatedDoc: TranslatedDocument | null;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onBack: () => void;
}

const ChatInterface = ({ translatedDoc, chatMessages, setChatMessages, onBack }: ChatInterfaceProps) => {
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !translatedDoc) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");
    setIsSendingMessage(true);

    try {
      // Convert document blob to base64 for context
      const arrayBuffer = await translatedDoc.blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch('https://jordaandigi.app.n8n.cloud/webhook-test/pdf-translate-chat-V2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentInput,
          document_context: {
            filename: translatedDoc.filename,
            content: base64
          },
          user_id: user?.id,
          chat_history: chatMessages.filter(msg => msg.id !== 'system').map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 Chat response:', data);
      
      // Extract the response content - try multiple possible fields
      let responseContent = '';
      if (data.answer) {
        responseContent = data.answer;
      } else if (data.response) {
        responseContent = data.response;
      } else if (data.text) {
        responseContent = data.text;
      } else if (data.message) {
        responseContent = data.message;
      } else if (typeof data === 'string') {
        responseContent = data;
      } else {
        responseContent = "I received your question and I'm processing it.";
      }
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E1] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="text-[#333333] hover:bg-[#EEEEEE] p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Translation
          </Button>
          <h2 className="text-lg font-medium text-[#333333]">
            {translatedDoc?.filename || "Document Chat"}
          </h2>
          <UserMenu />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatMessages.map(message => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                message.isUser 
                  ? 'bg-[#CCCCCC] text-[#333333]' 
                  : message.id === 'system' 
                    ? 'bg-[#EEEEEE] text-[#666666] text-center' 
                    : 'bg-white text-[#333333]'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow-sm bg-white text-[#333333]">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-[#AAAAAA] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#AAAAAA] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#AAAAAA] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            placeholder="Ask a question about your document..." 
            className="flex-1 border-[#CCCCCC] focus:border-[#AAAAAA]" 
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()} 
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
};

export default ChatInterface;


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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

      const response = await fetch('https://jordaandigi.app.n8n.cloud/webhook/5effaeee-25b4-4947-a770-48043ee8d095/chat', {
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
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Response keys:', Array.isArray(data) ? 'Array with length:' + data.length : Object.keys(data));
      
      // Extract the response content - handle the "output" field format
      let responseContent = '';
      
      // Strategy 1: Handle array format like [{"output": "text"}]
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (firstItem.output) {
          responseContent = firstItem.output;
          console.log('✅ Found output in array format data[0].output');
        } else if (firstItem.answer) {
          responseContent = firstItem.answer;
          console.log('✅ Found answer in array format data[0].answer');
        } else if (firstItem.response) {
          responseContent = firstItem.response;
          console.log('✅ Found response in array format data[0].response');
        } else if (firstItem.text) {
          responseContent = firstItem.text;
          console.log('✅ Found text in array format data[0].text');
        } else if (firstItem.message) {
          responseContent = firstItem.message;
          console.log('✅ Found message in array format data[0].message');
        }
      }
      // Strategy 2: Direct field access
      else if (data.output) {
        responseContent = data.output;
        console.log('✅ Found output in data.output');
      } else if (data.answer) {
        responseContent = data.answer;
        console.log('✅ Found answer in data.answer');
      } else if (data.response) {
        responseContent = data.response;
        console.log('✅ Found response in data.response');
      } else if (data.text) {
        responseContent = data.text;
        console.log('✅ Found text in data.text');
      } else if (data.message) {
        responseContent = data.message;
        console.log('✅ Found message in data.message');
      } else if (data.content) {
        responseContent = data.content;
        console.log('✅ Found content in data.content');
      } else if (typeof data === 'string') {
        responseContent = data;
        console.log('✅ Response data is directly a string');
      }
      // Strategy 3: Try to find any string value in the response
      else {
        const stringValues = Object.values(data).filter(value => typeof value === 'string' && value.length > 10);
        if (stringValues.length > 0) {
          responseContent = stringValues[0] as string;
          console.log('✅ Found response in first long string value');
        } else {
          console.log('❌ No suitable response text found in webhook response');
          responseContent = "I received your question but couldn't extract the response. Please try again.";
        }
      }
      
      console.log('📝 Final chat response content:', responseContent);
      
      if (!responseContent || responseContent.trim().length === 0) {
        responseContent = "I received your question but the response was empty. Please try again.";
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
                {message.isUser ? (
                  message.content
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        h1: ({children}) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                        h2: ({children}) => <h2 className="text-sm font-semibold mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                        code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                        pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{children}</pre>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
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

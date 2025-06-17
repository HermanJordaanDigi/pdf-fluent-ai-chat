
import { useState } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const useChatMode = () => {
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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

  return {
    chatMode,
    chatMessages,
    setChatMode,
    setChatMessages,
    initializeChat
  };
};

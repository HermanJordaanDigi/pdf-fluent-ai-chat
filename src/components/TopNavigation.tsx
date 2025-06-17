
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MessageCircle, LogIn, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserMenu from '@/components/UserMenu';

interface TopNavigationProps {
  chatMode: boolean;
  onChatModeChange: () => void;
  translatedDoc: any;
}

const TopNavigation = ({ chatMode, onChatModeChange, translatedDoc }: TopNavigationProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#DDDDDD] px-6 lg:px-10 py-3 bg-[#F5F0E1]">
      {/* Logo and Brand */}
      <div className="flex items-center gap-4 text-[#333333]">
        <div className="size-6">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-[#333333] text-lg font-bold leading-tight tracking-[-0.015em]">ClaroDoc</h2>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 justify-end gap-8">
        <div className="hidden md:flex items-center gap-9">
          <a className="text-[#333333] text-sm font-medium leading-normal hover:text-[#555555] transition-colors" href="#">Home</a>
          <a className="text-[#333333] text-sm font-medium leading-normal hover:text-[#555555] transition-colors" href="#">Features</a>
          <a className="text-[#333333] text-sm font-medium leading-normal hover:text-[#555555] transition-colors" href="#">Pricing</a>
          <a className="text-[#333333] text-sm font-medium leading-normal hover:text-[#555555] transition-colors" href="#">Support</a>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Chat Mode Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <MessageCircle className="h-4 w-4 text-[#333333]" />
            <span className="text-sm text-[#333333]">Chat Mode</span>
            <Switch 
              checked={chatMode} 
              onCheckedChange={onChatModeChange} 
              disabled={!translatedDoc} 
              className="data-[state=checked]:bg-[#AAAAAA]" 
            />
          </div>
          
          {/* User Menu or Login Button */}
          {user ? (
            <UserMenu />
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-[#AAAAAA] hover:bg-white hover:text-[#333333] border border-[#AAAAAA]"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;

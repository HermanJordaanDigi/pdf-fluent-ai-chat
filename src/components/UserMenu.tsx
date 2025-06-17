
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserMenu = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  // Extract first name and initial from user metadata or email
  const getDisplayName = () => {
    const fullName = user.user_metadata?.full_name;
    
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
      return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
    }
    
    // Fallback to email if no full name
    const emailParts = user.email?.split('@')[0] || '';
    return emailParts.charAt(0).toUpperCase() + emailParts.slice(1);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-[#333333] hover:bg-[#EEEEEE] p-2">
          <User className="h-4 w-4 mr-2" />
          {getDisplayName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2" />
          My Translations
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

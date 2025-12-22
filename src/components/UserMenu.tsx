
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [userInitials, setUserInitials] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (user) {
      // Try to get data from user_metadata first
      const metadataFullName = user.user_metadata?.full_name;
      if (metadataFullName) {
        setFullName(metadataFullName);
        generateInitialsFromName(metadataFullName);
      } else {
        // If not in metadata, try to fetch from profiles table
        fetchUserProfile();
      }
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.full_name) {
        setFullName(data.full_name);
        generateInitialsFromName(data.full_name);
      } else {
        // Fallback to email if no profile or full name
        generateInitialsFromEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to email
      generateInitialsFromEmail(user.email || '');
    }
  };

  const generateInitialsFromName = (name: string) => {
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length >= 2) {
      // Get first letter of first and last name
      const initials = `${nameParts[0][0]}.${nameParts[nameParts.length - 1][0]}`;
      setUserInitials(initials.toUpperCase());
    } else if (nameParts.length === 1) {
      // If only one name, use first two letters or just first letter with dot
      setUserInitials(`${nameParts[0][0]}.`);
    }
  };

  const generateInitialsFromEmail = (email: string) => {
    const emailName = email.split('@')[0];
    if (emailName.length > 0) {
      setUserInitials(emailName[0].toUpperCase() + '.');
    } else {
      setUserInitials('U.');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-[#333333] hover:bg-[#EEEEEE] p-2">
          <User className="h-4 w-4 mr-2" />
          {userInitials || '...'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {fullName && (
          <div className="px-2 py-1.5 text-sm font-medium text-gray-700 border-b mb-1">
            {fullName}
          </div>
        )}
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

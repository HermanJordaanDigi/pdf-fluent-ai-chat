
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, MessageCircle, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Translation {
  id: string;
  original_filename: string;
  translated_filename: string;
  file_size: number;
  status: string;
  summary: string | null;
  insights: any;
  created_at: string;
}

const UserDashboard = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTranslations();
    }
  }, [user]);

  const fetchTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load translation history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#EEEEEE] rounded h-16"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg text-[#333333] flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Translation History
        </CardTitle>
        <CardDescription className="text-[#666666]">
          {translations.length} translation{translations.length !== 1 ? 's' : ''} completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {translations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-[#CCCCCC] mx-auto mb-4" />
            <p className="text-[#666666]">No translations yet</p>
            <p className="text-[#AAAAAA] text-sm">Upload a PDF to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {translations.map((translation) => (
              <div key={translation.id} className="border border-[#CCCCCC] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#333333] mb-1">
                      {translation.original_filename}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-[#666666]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(translation.created_at)}
                      </span>
                      <span>{formatFileSize(translation.file_size)}</span>
                      <Badge variant="secondary" className="bg-[#EEEEEE] text-[#333333]">
                        {translation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {translation.summary && (
                  <div className="mt-3 p-3 bg-[#FAFAFA] rounded border border-[#EEEEEE]">
                    <p className="text-sm text-[#333333] line-clamp-2">
                      {translation.summary}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-[#CCCCCC] text-[#333333]">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#CCCCCC] text-[#333333]">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDashboard;

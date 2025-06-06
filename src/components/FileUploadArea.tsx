import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
interface FileUploadAreaProps {
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}
const FileUploadArea = ({
  onFileUpload,
  isUploading
}: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };
  return <Card className="mb-8 shadow-lg border-0">
      <CardContent className="py-[10px] px-[2px] my-0">
        <div className="border-2 border-dashed border-[#CCCCCC] rounded-lg p-8 text-center mb-6 transition-colors hover:border-[#AAAAAA]" onDragOver={handleDragOver} onDrop={handleDrop}>
          <Upload className="h-8 w-8 text-[#333333] mx-auto mb-4" />
          <p className="text-[#333333] mb-4">
            Drop PDF here or click to browse
          </p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => e.target.files?.[0] && onFileUpload(e.target.files[0])} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-[#AAAAAA] hover:bg-white hover:text-[#333333] border border-[#AAAAAA]">
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-xs text-[#AAAAAA] text-center">Powered by AI</p>
      </CardContent>
    </Card>;
};
export default FileUploadArea;
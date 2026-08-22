import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface LogoUploaderProps {
  onLogoChange: (file: File | null) => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ onLogoChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG).');
      return;
    }
    onLogoChange(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative w-full border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
        dragActive 
          ? 'border-[#163A2B] bg-[#163A2B]/5' 
          : 'border-[#E9E5D9] bg-white hover:border-[#163A2B]/40 hover:bg-slate-50/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 border border-[#E9E5D9] rounded-xl overflow-hidden bg-white shadow-3xs flex items-center justify-center">
            <img src={previewUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-1" />
            <button 
              type="button"
              onClick={handleClear}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-xs border-none cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs font-semibold text-[#182018]/80">Company logo uploaded</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#687067]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#182018] block">Upload company logo</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Drag and drop or click to choose file</span>
          </div>
        </div>
      )}
    </div>
  );
};

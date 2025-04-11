"use client";

import { useState, useRef } from 'react';

export const ImageInput = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
      >
        Upload Image
      </button>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="max-w-[200px] max-h-[200px] object-contain"
        />
      )}
    </div>
  );
}; 
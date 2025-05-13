// components/ResumeDropzone.tsx
import React, { useRef, useState } from "react";

interface ResumeDropzoneProps {
  onFileSelect: (file: File) => void;
  fileName?: string;
  fileError?: string;
  onUpdateResume?: () => void;
}

const ResumeDropzone: React.FC<ResumeDropzoneProps> = ({ onFileSelect, fileName, fileError, onUpdateResume }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-gray-100"}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}>
      <p className="text-gray-600">Drag & drop your resume here (PDF only &lt;2mb)</p>
      <p className="text-sm text-gray-400 mt-2">or click to upload</p>

      {fileName && <p className="text-green-600 mt-2">{fileName}</p>}

      {fileName && !fileError && onUpdateResume && (
        <button
          className="btn_primary mt-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            if (fileName) onUpdateResume();
          }}>
          Update Resume
        </button>
      )}

      <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

      {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
    </div>
  );
};

export default ResumeDropzone;

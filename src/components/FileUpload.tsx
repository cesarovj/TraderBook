"use client";

import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileLoaded: (content: string, filename: string) => void;
}

export default function FileUpload({ onFileLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoaded(content, file.name);
      };
      reader.readAsText(file);
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer"
      style={{
        background: isDragging ? "rgba(99,102,241,0.08)" : "var(--bg-card)",
        border: isDragging ? "2px dashed #6366f1" : "2px dashed var(--border)",
        minHeight: 200,
      }}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.12)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-white">Drop your Sierra Chart trade log here</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          or click to browse — supports .txt tab-separated exports
        </p>
      </div>
      <input
        id="file-input"
        type="file"
        accept=".txt,.csv,.tsv"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

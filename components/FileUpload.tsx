
import React, { useRef } from 'react';

interface FileUploadProps {
  onUpload: (base64: string, mimeType: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      onUpload(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-12 border-2 border-dashed border-gray-200 flex flex-col items-center transition-all hover:border-indigo-400">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Exam Paper</h2>
      <p className="text-gray-500 text-center max-w-sm mb-8">
        We support PDF, JPEG, and PNG. Our AI will analyze the questions and create a practice test for you.
      </p>
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
      >
        Choose File
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf"
        className="hidden"
      />
      
      <div className="mt-8 flex gap-4 text-xs text-gray-400 uppercase tracking-widest font-semibold">
        <span>MCQ Support</span>
        <span>•</span>
        <span>Subjective Practice</span>
        <span>•</span>
        <span>Voice Grading</span>
      </div>
    </div>
  );
};

export default FileUpload;

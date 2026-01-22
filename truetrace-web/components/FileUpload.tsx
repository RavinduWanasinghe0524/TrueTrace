'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FileUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export default function FileUpload({ onAnalyze, isAnalyzing }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile && !isAnalyzing) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {!preview ? (
          /* UPLOAD AREA - SUPER SIMPLE */
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isAnalyzing}
            />
            <div className="glass rounded-3xl p-16 border-2 border-dashed border-white/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
              <div className="text-center">
                {/* Big Upload Icon */}
                <div className="text-8xl mb-6">📤</div>
                
                {/* Big Clear Text */}
                <h3 className="text-4xl font-bold text-white mb-4">
                  Click to Upload Your Photo
                </h3>
                
                <p className="text-xl text-gray-400">
                  Choose any photo from your computer
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW & BUTTON - SUPER SIMPLE */
          <div className="space-y-6">
            {/* Photo Preview */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50">
              <Image
                src={preview}
                alt="Your photo"
                fill
                className="object-contain"
              />
            </div>

            {/* Two Simple Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                disabled={isAnalyzing}
                className="py-4 px-6 text-xl glass rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Choose Different Photo
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="py-4 px-6 text-xl bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl hover:from-cyan-500 hover:to-emerald-500 transition-all font-bold disabled:opacity-50"
              >
                {isAnalyzing ? 'Checking...' : 'Check It'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

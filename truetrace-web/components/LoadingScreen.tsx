'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  stage?: string;
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center max-w-md px-6">
        {/* Simple Spinner */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 border-8 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>

        {/* Simple Message */}
        <h2 className="text-4xl font-bold text-white mb-4">
          Checking Your Photo...
        </h2>
        
        <p className="text-xl text-gray-400 mb-8">
          This will take just a few seconds
        </p>

        {/* Simple Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <p className="text-sm text-gray-500 mt-3">
          {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
}

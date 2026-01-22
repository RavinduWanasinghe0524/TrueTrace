'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { useState } from 'react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Determine simple verdict
  const getVerdict = () => {
    if (result.finalScore >= 70) {
      return {
        emoji: '✅',
        title: 'YOUR PHOTO IS REAL',
        message: 'We didn\'t find signs of editing',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
      };
    } else if (result.finalScore >= 40) {
      return {
        emoji: '⚠️',
        title: 'YOUR PHOTO MIGHT BE EDITED',
        message: 'We found some unusual things',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30'
      };
    } else {
      return {
        emoji: '❌',
        title: 'YOUR PHOTO WAS EDITED',
        message: 'We found clear signs of editing',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      };
    }
  };

  const verdict = getVerdict();

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* MAIN RESULT - HUGE AND CLEAR */}
        <div className={`glass rounded-3xl p-12 text-center border-2 ${verdict.borderColor} ${verdict.bgColor}`}>
          {/* Giant Emoji */}
          <div className="text-9xl mb-6">
            {verdict.emoji}
          </div>

          {/* Giant Verdict */}
          <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${verdict.color}`}>
            {verdict.title}
          </h2>

          {/* Simple Message */}
          <p className="text-2xl md:text-3xl text-white mb-8">
            {verdict.message}
          </p>

          {/* Confidence Score - Simple */}
          <div className="inline-block px-8 py-4 glass rounded-2xl">
            <p className="text-gray-400 text-sm mb-1">Confidence</p>
            <p className="text-4xl font-bold gradient-text">{result.finalScore}%</p>
          </div>
        </div>

        {/* Optional Details - Collapsed by Default */}
        <div className="mt-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 glass rounded-xl hover:bg-white/10 transition-all text-lg"
          >
            {showDetails ? '▲ Hide Technical Details' : '▼ Show Technical Details'}
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 glass rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-white">
                We ran {result.results.length} checks on your photo:
              </h3>
              
              <div className="space-y-3">
                {result.results.map((check, index) => {
                  const icon = check.result === 'Pass' ? '✅' : check.result === 'Fail' ? '❌' : '⚠️';
                  const statusText = check.result === 'Pass' ? 'Looks good' : check.result === 'Fail' ? 'Found issues' : 'Uncertain';
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{check.detector}</p>
                        <p className="text-sm text-gray-400">{statusText} ({check.score}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

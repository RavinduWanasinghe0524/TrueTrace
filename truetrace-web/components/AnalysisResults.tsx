'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const getResultColor = (resultType: string) => {
    switch (resultType) {
      case 'Pass':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'Fail':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'Warning':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getResultIcon = (resultType: string) => {
    switch (resultType) {
      case 'Pass':
        return '✓';
      case 'Fail':
        return '✕';
      case 'Warning':
        return '⚠';
      default:
        return '?';
    }
  };

  const getFakeProbabilityColor = (score: number) => {
    if (score < 30) return 'from-green-500 to-emerald-500';
    if (score < 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getFakeProbabilityLabel = (score: number) => {
    if (score < 30) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Overall Score Card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6 gradient-text text-center">
            Analysis Complete
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(result.finalScore / 100) * 553} 553`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`${result.finalScore < 30 ? 'stop-color-green-500' : result.finalScore < 70 ? 'stop-color-yellow-500' : 'stop-color-red-500'}`} />
                    <stop offset="100%" className={`${result.finalScore < 30 ? 'stop-color-emerald-500' : result.finalScore < 70 ? 'stop-color-orange-500' : 'stop-color-pink-500'}`} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{result.finalScore.toFixed(1)}%</span>
                <span className="text-sm text-gray-400 mt-1">Fake Probability</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="text-center md:text-left">
              <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getFakeProbabilityColor(result.finalScore)} text-white font-bold mb-4`}>
                {getFakeProbabilityLabel(result.finalScore)}
              </div>
              <p className="text-gray-300 max-w-md">
                {result.finalScore < 30
                  ? 'The image appears to be authentic with minimal signs of manipulation.'
                  : result.finalScore < 70
                  ? 'Some signs of potential manipulation detected. Further investigation recommended.'
                  : 'High likelihood of manipulation detected. This image shows significant signs of forgery.'}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Detector Results */}
        <div className="grid md:grid-cols-3 gap-6">
          {result.results.map((detectorResult, index) => (
            <motion.div
              key={detectorResult.detector}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass rounded-2xl p-6 border-2 ${getResultColor(detectorResult.result)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{detectorResult.detector}</h3>
                <span className="text-3xl">{getResultIcon(detectorResult.result)}</span>
              </div>

              <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${getResultColor(detectorResult.result)}`}>
                {detectorResult.result}
              </div>

              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {detectorResult.details}
              </p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Score</span>
                  <span className="font-bold">{detectorResult.score}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

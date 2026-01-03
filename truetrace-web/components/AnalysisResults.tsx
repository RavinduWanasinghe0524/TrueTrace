'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import ConfidenceMeter from './ConfidenceMeter';
import RadarChart from './RadarChart';
import AnalysisTimeline from './AnalysisTimeline';

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

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Confidence Meter */}
            <ConfidenceMeter score={result.finalScore} />

            {/* Radar Chart */}
            <RadarChart results={result.results} />
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

        {/* Analysis Timeline */}
        <div className="glass rounded-3xl p-8">
          <AnalysisTimeline results={result.results} />
        </div>
      </motion.div>
    </div>
  );
}

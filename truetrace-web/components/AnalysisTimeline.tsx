'use client';

import { motion } from 'framer-motion';
import { DetectorResult } from '@/lib/types';

interface TimelineEvent {
  title: string;
  description: string;
  status: 'Pass' | 'Fail' | 'Warning';
  icon: string;
  timestamp: string;
}

interface AnalysisTimelineProps {
  results: DetectorResult[];
}

export default function AnalysisTimeline({ results }: AnalysisTimelineProps) {
  const events: TimelineEvent[] = [
    {
      title: 'Image Upload',
      description: 'Image received and validated',
      status: 'Pass',
      icon: '📤',
      timestamp: '0.0s'
    },
    ...results.map((result, index) => ({
      title: result.detector,
      description: result.details.split('.')[0] + '.',
      status: result.result,
      icon: result.result === 'Pass' ? '✓' : result.result === 'Fail' ? '✕' : '⚠',
      timestamp: `${(index + 1) * 0.3}s`
    })),
    {
      title: 'Analysis Complete',
      description: 'All detection methods processed successfully',
      status: 'Pass',
      icon: '🎯',
      timestamp: `${(results.length + 1) * 0.3}s`
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'border-green-500 bg-green-500/10 text-green-400';
      case 'Fail': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'Warning': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-8 gradient-text text-center">Analysis Timeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              className="relative flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              {/* Icon Circle */}
              <div className={`relative z-10 w-16 h-16 flex-shrink-0 rounded-full border-2 ${getStatusColor(event.status)} flex items-center justify-center text-2xl font-bold`}>
                {event.icon}
                
                {/* Pulse Animation */}
                {index === events.length - 1 && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-500"
                    animate={{
                      scale: [1, 1.5, 1.5],
                      opacity: [1, 0, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                )}
              </div>

              {/* Content Card */}
              <motion.div
                className="flex-1 glass rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: event.status === 'Pass' ? '#10b981' : event.status === 'Fail' ? '#ef4444' : '#f59e0b' }}
                whileHover={{ scale: 1.02, translateX: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{event.title}</h4>
                  <span className="text-xs text-gray-400 font-mono bg-black/30 px-2 py-1 rounded">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                
                {/* Status Badge */}
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

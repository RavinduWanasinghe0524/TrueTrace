'use client';

import { motion } from 'framer-motion';
import { DetectorResult } from '@/lib/types';

interface RadarChartProps {
  results: DetectorResult[];
}

export default function RadarChart({ results }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 40;
  const levels = 5;

  // Calculate points for the data polygon
  const getPoint = (angle: number, value: number) => {
    const radian = (angle * Math.PI) / 180;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(radian - Math.PI / 2),
      y: center + r * Math.sin(radian - Math.PI / 2),
    };
  };

  const angleStep = 360 / results.length;
  
  const dataPoints = results.map((result, index) => {
    const angle = index * angleStep;
    return getPoint(angle, result.score);
  });

  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-6 gradient-text">Detection Analysis</h3>
      
      <svg width={size} height={size} className="relative">
        {/* Background Circles */}
        {Array.from({ length: levels }).map((_, i) => {
          const r = ((i + 1) / levels) * radius;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Lines */}
        {results.map((_, index) => {
          const angle = index * angleStep;
          const point = getPoint(angle, 100);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon with Animation */}
        <motion.polygon
          points={dataPolygon}
          fill="url(#radarGradient)"
          stroke="url(#radarStroke)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data Points */}
        {dataPoints.map((point, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="none"
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </motion.g>
        ))}

        {/* Labels */}
        {results.map((result, index) => {
          const angle = index * angleStep;
          const labelPoint = getPoint(angle, 115);
          const isTop = angle > 90 && angle < 270;
          
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-white"
            >
              <tspan x={labelPoint.x} dy={isTop ? 12 : -12}>
                {result.detector}
              </tspan>
              <tspan x={labelPoint.x} dy={14} className="text-blue-400 font-bold">
                {result.score}%
              </tspan>
            </text>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
        {results.map((result, index) => (
          <motion.div
            key={result.detector}
            className={`glass rounded-lg p-3 border-l-4 ${
              result.result === 'Pass' ? 'border-green-500' :
              result.result === 'Fail' ? 'border-red-500' :
              'border-yellow-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">{result.detector}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                result.result === 'Pass' ? 'bg-green-500/20 text-green-400' :
                result.result === 'Fail' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {result.result}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

export default function Examples() {
  return (
    <div className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-black/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          What Results Look Like
        </h2>
        <p className="text-xl text-gray-400 text-center mb-12">
          Here&apos;s what you can expect when you upload a photo
        </p>

        {/* Example Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Real Photo Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 border-2 border-green-500/30 bg-green-500/5"
          >
            <div className="text-7xl text-center mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-400 mb-3 text-center">
              Real Photo
            </h3>
            <div className="space-y-3 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                <p className="text-3xl font-bold gradient-text">85%</p>
              </div>
              <p className="text-gray-300">
                &quot;We didn&apos;t find signs of editing&quot;
              </p>
              <div className="space-y-2 text-left text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-400">Metadata intact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-400">Consistent compression</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-400">Natural noise patterns</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Uncertain Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-2xl p-6 border-2 border-yellow-500/30 bg-yellow-500/5"
          >
            <div className="text-7xl text-center mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-3 text-center">
              Uncertain
            </h3>
            <div className="space-y-3 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                <p className="text-3xl font-bold gradient-text">55%</p>
              </div>
              <p className="text-gray-300">
                &quot;We found some unusual things&quot;
              </p>
              <div className="space-y-2 text-left text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span className="text-gray-400">Missing metadata</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-400">Compression looks OK</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span className="text-gray-400">Minor noise variations</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Edited Photo Example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-2xl p-6 border-2 border-red-500/30 bg-red-500/5"
          >
            <div className="text-7xl text-center mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-400 mb-3 text-center">
              Edited Photo
            </h3>
            <div className="space-y-3 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                <p className="text-3xl font-bold gradient-text">25%</p>
              </div>
              <p className="text-gray-300">
                &quot;We found clear signs of editing&quot;
              </p>
              <div className="space-y-2 text-left text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">✗</span>
                  <span className="text-gray-400">Modified metadata</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">✗</span>
                  <span className="text-gray-400">Compression mismatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">✗</span>
                  <span className="text-gray-400">Inconsistent noise</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 glass rounded-2xl p-8 text-center"
        >
          <p className="text-lg text-gray-300 mb-4">
            <strong className="text-white">Pro Tip:</strong> For best accuracy, upload original photos directly from your camera or phone.
          </p>
          <p className="text-gray-400">
            Avoid screenshots, social media downloads, or heavily compressed images.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

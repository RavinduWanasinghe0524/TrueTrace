'use client';

import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      emoji: '📤',
      title: 'Upload Your Photo',
      description: 'Choose any JPEG or PNG image from your computer. We support photos up to 10MB.'
    },
    {
      emoji: '🔍',
      title: 'We Analyze It',
      description: 'Our system runs 4 different checks to look for signs of editing or manipulation.'
    },
    {
      emoji: '✅',
      title: 'Get Your Answer',
      description: 'See if your photo is real or edited, with a simple confidence score.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          How It Works
        </h2>
        <p className="text-xl text-gray-400 text-center mb-12">
          Three simple steps to check your photo
        </p>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <div className="text-6xl mb-4">{step.emoji}</div>
              <div className="text-2xl font-bold text-white mb-3">
                {index + 1}. {step.title}
              </div>
              <p className="text-gray-300 text-lg">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* What We Check */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-white mb-6 text-center">
            What We Check For
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-xl font-bold text-white mb-2">Photo Information</h4>
              <p className="text-gray-400">
                We check the hidden data in your photo (like camera info, date, location) to see if it's been modified.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="text-xl font-bold text-white mb-2">Compression Levels</h4>
              <p className="text-gray-400">
                Edited areas have different compression than original areas. We highlight these differences.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl mb-3">🔊</div>
              <h4 className="text-xl font-bold text-white mb-2">Digital Noise</h4>
              <p className="text-gray-400">
                Real photos have consistent noise patterns. Editing creates inconsistencies we can detect.
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="text-xl font-bold text-white mb-2">AI Detection</h4>
              <p className="text-gray-400">
                Our AI analyzes patterns that humans can't see to spot sophisticated edits.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

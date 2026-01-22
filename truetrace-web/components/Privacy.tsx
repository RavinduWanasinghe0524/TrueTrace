'use client';

import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          Your Privacy Matters
        </h2>
        <p className="text-xl text-gray-400 text-center mb-12">
          How we handle your photos
        </p>

        {/* Privacy Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="glass rounded-2xl p-8">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-3">We Don't Store Photos</h3>
            <p className="text-gray-300 text-lg">
              Your photos are analyzed in real-time and immediately deleted. We never save, store, or keep your images.
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Account Needed</h3>
            <p className="text-gray-300 text-lg">
              You don't need to sign up or provide any personal information. Just upload and get results.
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-white mb-3">Instant Processing</h3>
            <p className="text-gray-300 text-lg">
              All analysis happens in your browser session. When you close the page, everything is gone.
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold text-white mb-3">Secure Connection</h3>
            <p className="text-gray-300 text-lg">
              All data is transmitted over secure HTTPS connections to protect your privacy.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="glass rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Have More Questions?</h3>
          <p className="text-gray-300 text-lg mb-6">
            We're committed to transparency and your privacy. If you have concerns or questions, feel free to reach out.
          </p>
          <a 
            href="mailto:support@ironlogix.com" 
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl hover:from-cyan-500 hover:to-emerald-500 transition-all font-bold text-lg"
          >
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}

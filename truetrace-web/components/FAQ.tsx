'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Is it free to use?',
      answer: 'Yes! TrueTrace is completely free. Upload and check as many photos as you want.'
    },
    {
      question: 'What happens to my photos?',
      answer: 'Your privacy matters. We analyze your photos in real-time and don\'t save them. Once you close the page, your photo is gone from our system.'
    },
    {
      question: 'What file types can I upload?',
      answer: 'We accept JPEG and PNG images up to 10MB in size. These are the most common photo formats.'
    },
    {
      question: 'How accurate is TrueTrace?',
      answer: 'Our system combines 4 different detection methods. While no system is 100% perfect, we provide a confidence score so you can see how certain we are about the result.'
    },
    {
      question: 'What does the confidence score mean?',
      answer: '70-100% means the photo is likely real. 40-69% means we found some concerns. 0-39% means we found clear signs of editing.'
    },
    {
      question: 'Can it detect all types of edits?',
      answer: 'We can detect most common edits like copy-paste, filters, and retouching. Very subtle or professional edits might be harder to detect.'
    },
    {
      question: 'How long does analysis take?',
      answer: 'Most photos are analyzed in 3-10 seconds, depending on the file size and complexity.'
    },
    {
      question: 'Can I use this for legal purposes?',
      answer: 'TrueTrace is a helpful tool, but it\'s not a legal certification. For official forensic analysis, please consult a professional forensic expert.'
    },
    {
      question: 'Does it work on screenshots?',
      answer: 'Yes, but screenshots often lose original metadata. We can still check compression and noise patterns.'
    },
    {
      question: 'What if I get an error?',
      answer: 'Try a different image format (JPEG or PNG), make sure the file is under 10MB, or try again in a few moments.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 gradient-text">
          Questions & Answers
        </h2>
        <p className="text-xl text-gray-400 text-center mb-12">
          Everything you need to know about TrueTrace
        </p>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <span className="text-2xl text-cyan-400 flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-5"
                >
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

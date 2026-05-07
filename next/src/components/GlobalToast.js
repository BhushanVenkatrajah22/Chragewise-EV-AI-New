"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEVData } from '@/context/EVDataContext';

export default function GlobalToast() {
  const { toastMessage } = useEVData();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700/50 flex items-center gap-3 font-outfit"
        >
          {toastMessage.includes('🛑') ? null : (
            <div className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
          )}
          <span className="text-sm font-medium tracking-wide whitespace-nowrap">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export const ShowdownLoadingView: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-charcoal-dark border border-gold/10 rounded-3xl relative overflow-hidden">
      {/* Background kinetic effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-30"></div>
      
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-gold/5 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Spinning Chip Animation */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-32 h-32 rounded-full border-[6px] border-dashed border-gold flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)] bg-charcoal-dark"
        >
          <div className="w-24 h-24 rounded-full border-4 border-gold/50 flex items-center justify-center">
            <span className="text-3xl text-gold font-black">♠</span>
          </div>
        </motion.div>

        {/* Text Sequence */}
        <div className="text-center space-y-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-display font-black text-white uppercase tracking-[0.2em]"
          >
            Evaluating Showdown
          </motion.h2>
          
          <div className="flex items-center justify-center gap-1.5">
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-gold"
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-mono text-gold/60 uppercase tracking-widest mt-4"
          >
            Distributing Pots • Calculating Side Pots
          </motion.p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-charcoal border border-gold/30 rounded-xl shadow-2xl z-[100] animate-scale-in">
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-charcoal border-b border-r border-gold/30 rotate-45"></div>
          <p className="text-[10px] font-bold text-cream/80 leading-relaxed uppercase tracking-widest">{content}</p>
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface ChapterSectionProps {
  content: string;
}

export const ChapterSection: React.FC<ChapterSectionProps> = ({ content }) => {
  // Simple markdown-like parser for bold text and list items
  const renderContent = (text: string) => {
    // Handle bold text **bold**
    let processed = text.split(/(\*\*.*?\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="relative inline-block px-1 mx-0.5">
            <span className="absolute inset-0 bg-gold/10 -skew-x-12" />
            <strong className="relative text-gold font-black italic tracking-tight font-display">{part.slice(2, -2)}</strong>
          </span>
        );
      }
      return part;
    });

    return processed;
  };

  if (content.startsWith('- ')) {
    return (
      <div className="flex gap-4 mb-4 group">
        <div className="mt-2.5 w-1.5 h-1.5 bg-gold/50 rounded-full group-hover:bg-gold shadow-gold transition-all" />
        <p className="flex-1 text-cream/60 leading-relaxed text-lg tracking-tight font-medium group-hover:text-cream transition-colors">
          {renderContent(content.slice(2))}
        </p>
      </div>
    );
  }

  if (/^\d+\./.test(content)) {
    const [num, ...rest] = content.split('. ');
    return (
      <div className="flex gap-4 mb-4 group">
        <span className="text-gold font-mono text-sm font-bold pt-1 opacity-50 group-hover:opacity-100 transition-opacity">0{num}</span>
        <p className="flex-1 text-cream/60 leading-relaxed text-lg tracking-tight font-medium group-hover:text-cream transition-colors">
          {renderContent(rest.join('. '))}
        </p>
      </div>
    );
  }

  return (
    <p className="mb-6 text-cream/80 leading-relaxed text-xl tracking-tight font-medium border-l-2 border-transparent hover:border-gold/20 pl-4 transition-colors">
      {renderContent(content)}
    </p>
  );
};

import React, { useState } from 'react';
import {
  BrainCircuit,
  BookOpen,
  Zap,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { FullAnalysisResponse } from '../lib/api';

interface AdvisorHUDProps {
    analysis: FullAnalysisResponse | null;
    loading: boolean;
    onRefresh: () => void;
    hasCards?: boolean;
}

const CONFIDENCE_STYLES: Record<string, { border: string; shadow: string; text: string; glow: string }> = {
    High: { border: 'border-green-500/20', shadow: 'shadow-green-500/5', text: 'text-green-400', glow: 'bg-green-500' },
    Medium: { border: 'border-gold/20', shadow: 'shadow-gold-subtle', text: 'text-gold', glow: 'bg-gold' },
    Low: { border: 'border-orange-500/30', shadow: 'shadow-orange-500/10', text: 'text-orange-400', glow: 'bg-orange-500' },
};

const ACTION_COLOR: Record<string, string> = {
    fold: 'text-red-400',
    check: 'text-cream',
    call: 'text-gold',
    raise: 'text-green-400',
    'all-in': 'text-green-400',
};

export function AdvisorHUD({ analysis, loading, onRefresh, hasCards = true }: AdvisorHUDProps) {
    if (!hasCards) {
        return <CardsRequired />;
    }

    if (!analysis && !loading) {
        return <IntelligenceOffline onBeginAnalysis={onRefresh} />;
    }

    const advice = analysis?.advice;
    const confidence = advice?.confidence || 'Medium';
    const styles = CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.Medium;

    return (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <motion.div
            className={`glass-dark border ${styles.border} rounded-xl p-4 transition-all duration-700 ${styles.shadow}`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className={styles.text} />
                <h2 className={`text-sm font-black tracking-wide uppercase ${styles.text}`}>
                  AI Coach
                </h2>
              </div>
              {advice && (
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.border} ${styles.text}`}>
                  {confidence} Confidence
                </span>
              )}
            </div>

            {(!analysis || loading) ? (
              <AnalysisSkeleton />
            ) : (
              <CoachView analysis={analysis!} onRefresh={onRefresh} loading={loading} styles={styles} />
            )}
          </motion.div>

          <RetrievedKnowledgeSection analysis={analysis} />
        </div>
    );
}

// --- Coach View: action headline, supporting math, natural paragraph ---
const CoachView: React.FC<{ analysis: FullAnalysisResponse; onRefresh: () => void; loading: boolean; styles: any }> = ({ analysis, onRefresh, loading, styles }) => {
    const { advice } = analysis;
    const actionColor = ACTION_COLOR[advice.action] || 'text-cream';

    return (
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Primary Action */}
        <div className="relative overflow-hidden rounded-xl p-4 border bg-gradient-to-r from-gold/10 via-gold/3 to-transparent border-gold/20 shadow-gold-subtle">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <motion.span
                            className={`w-2.5 h-2.5 rounded-full ${styles.glow} shadow-lg`}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <h2 className="text-[10px] font-black tracking-wider uppercase text-gold/60">Recommended Action</h2>
                    </div>
                    <h1 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-sm ${actionColor}`}>
                        {advice.action}
                        {advice.bet_sizing ? <span className="text-cream/70 text-2xl not-italic"> ${advice.bet_sizing.toFixed(0)}</span> : null}
                    </h1>
                </div>
                <motion.button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-3 rounded-full bg-black/40 border border-white/10 text-gold hover:bg-gold hover:text-black transition-all disabled:opacity-50"
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    title="Re-run analysis"
                >
                    <Zap size={20} className={loading ? 'animate-spin' : ''} />
                </motion.button>
            </div>

            {/* Supporting hand math */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gold/10 pt-3">
                <MathStat label="Hand Equity" value={`${(advice.win_probability * 100).toFixed(1)}%`} color="text-cream/90" />
                <MathStat label="Pot Odds Req." value={`${(advice.pot_odds * 100).toFixed(1)}%`} color="text-cream/80" />
                <MathStat label="EV" value={`${advice.ev > 0 ? '+' : ''}${advice.ev.toFixed(2)}`} color={advice.ev >= 0 ? 'text-green-400' : 'text-red-400'} />
            </div>
        </div>

        {/* Coach paragraph */}
        <div className="glass-dark border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={14} className="text-gold/60" />
            <h3 className="text-xs font-bold tracking-wide uppercase text-gold/70">Coach's Take</h3>
          </div>
          <p className="text-sm text-cream/80 leading-relaxed">
            {advice.coach_paragraph}
          </p>
        </div>
      </motion.div>
    );
};

const MathStat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
    <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase text-gold/40 tracking-wide">{label}</span>
        <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
);

// --- Book Citations (book + chapter only; RAG internals hidden) ---
const RetrievedKnowledgeSection: React.FC<{ analysis: FullAnalysisResponse | null }> = ({ analysis }) => {
    const [expanded, setExpanded] = useState(false);
    const chunks = analysis?.retrieved_knowledge || [];

    if (!chunks || chunks.length === 0) return null;

    const chapterLabel = (chunk: any): string | null => {
        if (chunk.chapter && String(chunk.chapter).toLowerCase() !== 'unknown') return chunk.chapter;
        return null;
    };

    return (
      <motion.div
        className="glass-dark border border-gold/20 rounded-xl p-3 shadow-gold-subtle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-gold" />
            <h3 className="text-xs font-black tracking-wide uppercase text-gold">
              From the Books
            </h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gold hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className="space-y-2">
          {(expanded ? chunks : chunks.slice(0, 2)).map((chunk, idx) => (
            <div
              key={chunk.chunk_id || idx}
              className="p-2.5 bg-black/20 border border-white/5 rounded-lg hover:border-gold/30 transition-all text-xs"
            >
              <div className="font-bold text-cream/90 mb-1">
                📖 {chunk.book_title}
                {chapterLabel(chunk) && (
                  <span className="text-cream/50 font-normal"> — {chapterLabel(chunk)}</span>
                )}
              </div>
              <div className="text-[11px] text-cream/60 italic border-l-2 border-gold/30 pl-2 py-0.5 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                "{chunk.snippet}"
              </div>
              {chunk.author && (
                <div className="mt-1 text-[9px] text-gold/50 text-right uppercase tracking-wider font-semibold">
                  — {chunk.author}
                </div>
              )}
            </div>
          ))}
        </div>

        {chunks.length > 2 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full mt-2 py-1 text-center text-[10px] font-bold text-gold/70 hover:text-gold uppercase tracking-wider transition-colors cursor-pointer"
          >
            + Show {chunks.length - 2} more
          </button>
        )}
      </motion.div>
    );
};

// --- Intelligence Offline ---
const IntelligenceOffline: React.FC<{ onBeginAnalysis: () => void }> = ({ onBeginAnalysis }) => (
    <motion.div
        className="glass-dark border border-gold/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
    >
      <BrainCircuit size={48} className="text-gold/20" />
      <div>
        <h3 className="text-gold font-black uppercase tracking-wide">Coach Standing By</h3>
        <p className="text-cream/40 text-[10px] uppercase font-bold tracking-wide mt-1">Initialize analysis to receive coaching advice</p>
      </div>
      <motion.button
        onClick={onBeginAnalysis}
        className="mt-4 px-6 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Begin Analysis
      </motion.button>
    </motion.div>
);

// --- Cards Required Placeholder ---
const CardsRequired: React.FC = () => (
    <motion.div
        className="glass-dark border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
    >
      <CreditCard size={48} className="text-white/10" />
      <div>
        <h3 className="text-cream/60 font-black uppercase tracking-wide">Hole Cards Missing</h3>
        <p className="text-cream/30 text-[10px] uppercase font-bold tracking-wide mt-1">Input your cards to enable AI analysis</p>
      </div>
    </motion.div>
);

const AnalysisSkeleton = () => (
    <motion.div
        className="space-y-4 py-8 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
        <div className="w-12 h-12 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-4" />
        <h3 className="text-gold font-black uppercase tracking-[0.2em] text-xs">Consulting the Coach...</h3>
        <p className="text-cream/40 text-[10px] uppercase tracking-wider">Evaluating equity, pot odds and book theory</p>
    </motion.div>
);

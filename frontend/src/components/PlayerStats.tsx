import React, { useState } from 'react';
import { Users, Shield, Info, ChevronDown, ChevronUp, Eye, Brain, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from './Tooltip';
import type { OpponentProfile } from '../lib/api';

interface PlayerStatsProps {
  stats: Record<string, OpponentProfile>;
  currentPlayer?: string;
}

// --- Stat Translation Layer ---
// Convert raw poker HUD stats into human-readable behavioral insights
const translateStatsToInsights = (data: OpponentProfile) => {
  const insights: string[] = [];

  // VPIP interpretation - hand selectivity
  const vpip = data.vpip || 0;
  if (vpip < 12) {
    insights.push("Plays very few hands");
  } else if (vpip < 20) {
    insights.push("Selective, plays premium hands");
  } else if (vpip < 30) {
    insights.push("Balanced hand selection");
  } else if (vpip < 45) {
    insights.push("Plays too many hands");
  } else {
    insights.push("Plays almost any hand");
  }

  // PFR interpretation - preflop aggression
  const pfr = data.pfr || 0;
  if (vpip > 0 && pfr / vpip < 0.3) {
    insights.push("Usually Limp-calls preflop");
  } else if (pfr > 8) {
    insights.push("Often raises first in");
  }

  // AGG interpretation - postflop aggression
  const agg = data.aggression || 0;
  if (agg < 1.5) {
    insights.push("Passive after the flop");
  } else if (agg < 2.5) {
    insights.push("Standard aggression");
  } else if (agg < 4) {
    insights.push("Aggressive player");
  } else {
    insights.push("Relentless aggression");
  }

  // C-bet interpretation
  const cb = data.cbet_success_rate || 0;
  if (cb > 70) {
    insights.push("Frequent continuation bets");
  } else if (cb < 40 && cb > 0) {
    insights.push("Often gives up on flops");
  }

  // 3-bet interpretation
  const threeBet = data.three_bet_rate || 0;
  if (threeBet > 8) {
    insights.push("Likes to 3-bet");
  } else if (threeBet < 3 && threeBet > 0) {
    insights.push("Rarely 3-bets");
  }

  // WTSD interpretation - showdown tendency
  const wtsd = data.wtsd || 0;
  if (wtsd > 35) {
    insights.push("Shows up with marginal hands");
  } else if (wtsd < 20 && wtsd > 0) {
    insights.push("Folds more than shows");
  }

  // Combine logic for behavioral summary
  if (vpip < 15 && agg > 3) {
    insights.push("Trappy, slows for traps");
  } else if (vpip > 40 && agg < 2) {
    insights.push("Calling station");
  } else if (vpip > 50 && agg > 4) {
    insights.push("Maniac style");
  }

  return insights.slice(0, 5); // Max 5 insights
};

const getArchetypeLabel = (data: OpponentProfile): string => {
  const vpip = data.vpip || 0;
  const agg = data.aggression || 0;
  const hands = data.total_hands || 0;

  // COLD START: Don't show archetype until enough hands
  if (hands < 10) return "Collecting Data";

  if (vpip < 12) return "Rock";
  if (vpip < 18 && agg < 2) return "Nit";
  if (vpip < 25 && agg > 2 && agg < 4) return "TAG";
  if (vpip > 35 && agg > 3.5) return "Maniac";
  if (vpip > 30 && agg < 2) return "Loose Passive";
  if (vpip > 30 && agg > 3) return "LAG";
  if (vpip < 20 && agg > 3) return "Trappy";
  return "Unknown";
};

const getExploitRecommendation = (data: OpponentProfile): string | null => {
  const vpip = data.vpip || 0;
  const agg = data.aggression || 0;
  const cb = data.cbet_success_rate || 0;

  if (vpip < 15 && agg > 3) {
    return "Value bet thin - they call with weak pairs";
  }
  if (agg < 1.5) {
    return "Bet/fold more - they rarely raise";
  }
  if (cb > 75) {
    return "Check-raise borderline hands";
  }
  if (vpip > 45) {
    return "Open wide, isolate limpers";
  }
  if (agg > 5) {
    return "Trap with strong hands, let them blast off";
  }
  if (agg < 2 && vpip > 25) {
    return "Bet draws aggressively for value";
  }

  return null;
};

const getConfidenceLabel = (hands: number): { color: string; label: string; icon: React.ReactNode } => {
  if (hands > 100) {
    return { color: "text-green-400", label: "High Confidence", icon: <Shield size={10} /> };
  }
  if (hands > 30) {
    return { color: "text-yellow-400", label: "Medium Read", icon: <Brain size={10} /> };
  }
  if (hands > 10) {
    return { color: "text-orange-400", label: "Limited Reads", icon: <Eye size={10} /> };
  }
  return { color: "text-cream/30", label: "Need More Hands", icon: <AlertTriangle size={10} /> };
};

const ARCHETYPE_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  "Rock": { bg: "bg-red-950/40", text: "text-red-400", border: "border-red-700/20", icon: "🪨" },
  "Nit": { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-700/20", icon: "🎯" },
  "TAG": { bg: "bg-green-950/40", text: "text-green-400", border: "border-green-700/20", icon: "🎮" },
  "LAG": { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-700/20", icon: "🔥" },
  "Maniac": { bg: "bg-purple-950/40", text: "text-purple-400", border: "border-purple-700/20", icon: "⚡" },
  "Loose Passive": { bg: "bg-yellow-950/40", text: "text-yellow-400", border: "border-yellow-700/20", icon: "🐢" },
  "Trappy": { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-700/20", icon: "🎭" },
  "Collecting Data": { bg: "bg-orange-950/40", text: "text-orange-400", border: "border-orange-700/20", icon: "📊" },
  "Unknown": { bg: "bg-white/5", text: "text-cream/40", border: "border-white/10", icon: "❓" }
};

export function PlayerStats({ stats, currentPlayer }: PlayerStatsProps) {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const displayStats = Object.keys(stats).length > 0 ? stats : {};

  const toggleExpand = (name: string) => {
    setExpandedPlayer(expandedPlayer === name ? null : name);
  };

  return (
    <div className="glass-dark border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Users className="text-gold/60" size={14} />
          <h3 className="text-xs font-bold tracking-widest uppercase text-cream/80">Opponent Reads</h3>
        </div>
        <Tooltip content="Click a player to see breakdown">
          <Info size={12} className="text-gold/30 hover:text-gold/60 transition-colors cursor-help" />
        </Tooltip>
      </div>

      <div className="space-y-2">
        {Object.entries(displayStats).length === 0 ? (
          <div className="text-center py-3">
            <p className="text-[9px] text-cream/30 font-semibold uppercase tracking-wider italic">Reading opponents...</p>
          </div>
        ) : (
          Object.entries(displayStats).map(([name, data]) => {
            if (name === "You") return null;
            const isActive = name === currentPlayer;
            const isExpanded = expandedPlayer === name;
            const archetype = getArchetypeLabel(data);
            const archetypeStyle = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS["Unknown"];
            const confidence = getConfidenceLabel(data.total_hands || 0);
            const insights = translateStatsToInsights(data);
            const exploitRec = getExploitRecommendation(data);

            return (
              <div key={name}>
                <div
                  onClick={() => toggleExpand(name)}
                  className={`bg-black/30 border ${isActive ? 'border-gold/40' : 'border-white/[0.03]'} rounded-xl p-3 transition-all hover:border-gold/20 cursor-pointer`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-cream/90">{name}</span>
                      <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded border ${archetypeStyle.bg} ${archetypeStyle.text} ${archetypeStyle.border}`}>
                        {archetypeStyle.icon} {archetype}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-semibold ${confidence.color} flex items-center gap-1`}>
                        {confidence.icon}
                      </span>
                      {isExpanded ? <ChevronUp size={14} className="text-gold/40" /> : <ChevronDown size={14} className="text-gold/30" />}
                    </div>
                  </div>

                  {/* Human-readable insights - main display */}
                  <div className="mt-2 space-y-1.5">
                    {insights.slice(0, 3).map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gold/50 mt-1">•</span>
                        <span className="text-xs text-cream/70 leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Exploit recommendation */}
                  {exploitRec && (
                    <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-green-950/20 border border-green-700/20 rounded-lg">
                      <Zap size={10} className="text-green-400 shrink-0" />
                      <span className="text-[9px] text-green-400 font-medium">{exploitRec}</span>
                    </div>
                  )}
                </div>

                {/* Expanded: Advanced Metrics */}
                <AnimatePresence>
                  {isExpanded && data.total_hands > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 p-3 bg-black/20 border border-white/[0.02] rounded-lg space-y-3">
                        {/* Confidence + Data Quality */}
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-gold/50 font-semibold uppercase tracking-wider">Data Quality</span>
                          <span className={`text-[9px] font-bold ${confidence.color} flex items-center gap-1`}>
                            {confidence.icon} {confidence.label} ({data.total_hands}h)
                          </span>
                        </div>

                        {/* All Insights - Full List */}
                        <div className="space-y-1">
                          <span className="text-[8px] text-white/30 font-semibold uppercase tracking-wider block mb-1">All Tendencies</span>
                          {insights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold/40 mt-1 text-[8px]">•</span>
                              <span className="text-xs text-cream/60">{insight}</span>
                            </div>
                          ))}
                        </div>

                        {/* Advanced Stats Grid */}
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[8px] text-white/30 font-semibold uppercase tracking-wider block mb-2">Advanced Metrics</span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">VPIP</span>
                              <span className="text-cream/70 font-mono">{data.vpip?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">PFR</span>
                              <span className="text-cream/70 font-mono">{data.pfr?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">AGG</span>
                              <span className="text-cream/70 font-mono">{data.aggression?.toFixed(1) || "0.0"}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">C-Bet</span>
                              <span className="text-cream/70 font-mono">{data.cbet_success_rate?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">3-Bet</span>
                              <span className="text-cream/70 font-mono">{data.three_bet_rate?.toFixed(1) || 0}%</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white/40">WTSD</span>
                              <span className="text-cream/70 font-mono">{data.wtsd?.toFixed(1) || 0}%</span>
                            </div>
                          </div>
                        </div>

                        {data.notes && (
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[8px] text-white/30 font-semibold uppercase tracking-wider block mb-1">Notes</span>
                            <p className="text-[9px] text-cream/50 italic line-clamp-2">{data.notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
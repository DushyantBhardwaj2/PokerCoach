import React, { useState } from 'react';
import {
  Play,
  Target,
  TrendingUp,
  BrainCircuit,
  Eye,
  Users,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Zap,
  BookOpen,
  Activity,
  BarChart3,
  Clock,
  Lightbulb,
  Gauge,
  WalletCards,
  MousePointerClick,
  FlaskConical,
  TrendingDown,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTION_TABS = [
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
  { id: 'interface', label: 'Interface', icon: MousePointerClick },
  { id: 'gameplay', label: 'Gameplay', icon: Play },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'theories', label: 'Theories', icon: BookOpen },
  { id: 'tips', label: 'Real Game Tips', icon: Lightbulb },
];

export const HowToUseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quickstart');

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gold/5 border border-gold/20 px-3 py-1.5 rounded-full">
          <Gauge size={14} className="text-gold" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gold">Comprehensive Guide</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          How to Use <span className="text-gold">PokerSense AI</span>
        </h1>
        <p className="text-cream/50 max-w-xl mx-auto text-sm leading-relaxed">
          Master real-time poker analysis with Monte Carlo simulations and behavioral profiling.
          This guide covers everything from setup to advanced strategic uso.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === tab.id
                ? 'bg-gold text-charcoal-dark shadow-gold'
                : 'bg-charcoal-light border border-white/5 text-cream/50 hover:text-cream hover:border-gold/20'}
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'quickstart' && <QuickStartSection key="quickstart" />}
          {activeTab === 'interface' && <InterfaceSection key="interface" />}
          {activeTab === 'gameplay' && <GameplaySection key="gameplay" />}
          {activeTab === 'analytics' && <AnalyticsSection key="analytics" />}
          {activeTab === 'theories' && <TheoriesSection key="theories" />}
          {activeTab === 'tips' && <TipsSection key="tips" />}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-center gap-4 pt-4">
        <a href="/play" className="group flex items-center gap-2 bg-gold hover:bg-gold-light text-charcoal-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-gold-strong">
          <Play size={16} />
          Start Playing
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="/theory" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-cream px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all">
          <BookOpen size={16} />
          Study Theory
        </a>
      </div>
    </div>
  );
};

// --- Quick Start Section ---
const QuickStartSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <Zap size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">Quick Start Guide</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {
          step: '01',
          title: 'Create Your Hand',
          desc: 'Input your two hole cards by clicking the card icons. Select cards from the popup selector.',
        },
        {
          step: '02',
          title: 'Set the Table',
          desc: 'Add opponents and set community cards (flop/turn/river) to define the game state.',
        },
        {
          step: '03',
          title: 'Get AI Analysis',
          desc: 'Click "Analyze" to receive real-time EV recommendations with strategic reasoning.',
        },
        {
          step: '04',
          title: 'Make Your Decision',
          desc: 'Review the recommendation, pot odds, and opponent reads, then act accordingly.',
        }
      ].map((item) => (
        <div key={item.step} className="bg-charcoal-light border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black text-gold/20">{item.step}</span>
            <h3 className="text-sm font-bold text-white uppercase">{item.title}</h3>
          </div>
          <p className="text-xs text-cream/50 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mt-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-gold shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Important Note</h4>
          <p className="text-xs text-cream/60">
            For best results, input at least 3-5 hands of observations on opponents before relying on behavioral analysis.
            The more hands you track, the more accurate the opponent profiling becomes.
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Interface Section ---
const InterfaceSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <MousePointerClick size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">Interface Overview</h2>
    </div>

    <div className="space-y-4">
      <InterfaceCard
        title="Virtual Poker Table"
        icon={WalletCards}
        description="The interactive table where you input hands, view community cards, and track player positions. Click on seat positions to set stacks and hole cards."
      />
      <InterfaceCard
        title="AI Advisor Panel"
        icon={BrainCircuit}
        description="Real-time strategic recommendations including recommended action, expected value (EV), pot odds requirements, and confidence level."
      />
      <InterfaceCard
        title="Opponent Reads"
        icon={Users}
        description="Behavioral profiling showing opponent archetypes (TAG, LAG, Rock, etc.) with VPIP/PFR statistics and exploitation recommendations."
      />
      <InterfaceCard
        title="Action Bar"
        icon={Target}
        description="Fold, Check, Call, Raise, and All-In buttons for recording your actions. Shows current player turn and stack sizes."
      />
    </div>

    <div className="bg-charcoal-light border border-white/5 rounded-xl p-4">
      <h3 className="text-xs font-bold text-gold uppercase tracking-wider mb-3">Keyboard Shortcuts</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between"><span className="text-cream/40">Fold</span><kbd className="bg-black/40 px-2 py-0.5 rounded text-cream/60">F</kbd></div>
        <div className="flex justify-between"><span className="text-cream/40">Check/Call</span><kbd className="bg-black/40 px-2 py-0.5 rounded text-cream/60">C</kbd></div>
        <div className="flex justify-between"><span className="text-cream/40">Raise</span><kbd className="bg-black/40 px-2 py-0.5 rounded text-cream/60">R</kbd></div>
        <div className="flex justify-between"><span className="text-cream/40">All-In</span><kbd className="bg-black/40 px-2 py-0.5 rounded text-cream/60">A</kbd></div>
      </div>
    </div>
  </motion.div>
);

const InterfaceCard = ({ title, icon: Icon, description }: { title: string, icon: any, description: string }) => (
  <div className="bg-charcoal-light border border-white/5 p-4 rounded-xl flex gap-3">
    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold shrink-0">
      <Icon size={16} />
    </div>
    <div>
      <h4 className="text-xs font-bold text-white uppercase mb-1">{title}</h4>
      <p className="text-xs text-cream/50 leading-relaxed">{description}</p>
    </div>
  </div>
);

// --- Gameplay Section ---
const GameplaySection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <Play size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">How Gameplay Works</h2>
    </div>

    <div className="space-y-4">
      <StepCard
        number="1"
        title="Setup the Hand"
        content="Enter the game parameters: number of players, big blind amount, and starting stacks. Assign hole cards to each player."
      />
      <StepCard
        number="2"
        title="Input Community Cards"
        content="As the hand progresses through pre-flop, flop, turn, and river, update the community cards. Click the eye icon on the table to edit."
      />
      <StepCard
        number="3"
        title="Record Actions"
        content="Use the action bar to record each player's decisions. The system tracks who acted, the action type, and bet sizing."
      />
      <StepCard
        number="4"
        title="Get AI Analysis"
        content="At any point, click 'Analyze' to receive strategic advice. The AI considers your hand, opponent ranges, and behavioral data."
      />
      <StepCard
        number="5"
        title="Resolve Showdown"
        content="At showdown, input the winning hand or let the system evaluate. Player stats are updated based on results."
      />
    </div>

    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <TrendingUp size={16} className="text-green-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Session Tracking</h4>
          <p className="text-xs text-cream/60">
            Your decisions are tracked across hands. The analytics page shows your VPIP, PFR, win rate, and detected strategic leaks over time.
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

const StepCard = ({ number, title, content }: { number: string, title: string, content: string }) => (
  <div className="flex gap-4">
    <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center text-gold text-xs font-bold shrink-0 mt-0.5">
      {number}
    </div>
    <div>
      <h4 className="text-sm font-bold text-white uppercase mb-1">{title}</h4>
      <p className="text-xs text-cream/50 leading-relaxed">{content}</p>
    </div>
  </div>
);

// --- Analytics Section ---
const AnalyticsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <BarChart3 size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">Understanding Poker Analytics</h2>
    </div>

    <p className="text-xs text-cream/50 leading-relaxed mb-4">
      Poker analytics measure your gameplay patterns. Understanding these metrics helps you identify strengths,
      spot weaknesses, and make data-driven improvements to your game. Below is a comprehensive guide to each metric.
    </p>

    {/* Core Stats with Detailed Explanations */}
    <div className="space-y-3">
      <DetailedStatCard
        label="Total Profit/Loss"
        abbr="Net $"
        fullForm="Net Earnings"
        whatItMeasures="Your total money won or lost in the current session"
        whyItMatters="The bottom line of your poker success - measures actual profitability"
        lowValue="Losing money - review your decision-making"
        highValue="Positive ROI - indicate profitable sessions"
        goodRange="$0 or higher"
        professional="Breaking even or profiting"
        beginnerTip="Don't chase losses. Focus on making +EV decisions, not recovering money."
        example="Winning $150 means you made $150 profit for the session."
        mistakes="Chasing losses, tilting after bad beats, forcing action"
        tipsToImprove="Stick to solid ranges, don't call too light, value bet thin"
      />
      <DetailedStatCard
        label="Win Rate"
        abbr="WR"
        fullForm="Showdown Win Percentage"
        whatItMeasures="Percentage of hands you win at showdown"
        whyItMatters="Direct indicator of hand strength - are you winning the big confrontations?"
        lowValue="Below 40% - may indicate poor hand selection"
        highValue="50%+ - indicates strong hand selection"
        goodRange="40-55%"
        professional="45-55% at 6-max tables"
        beginnerTip="High win rate with low volume means nothing. Variance is real - play 1000+ hands to know your true rate."
        example="52% win rate means you win showdown 52 out of every 100 hands."
        mistakes="Bluffing too much, showdown with weak hands, bad fold equity estimation"
        tipsToImprove="Play stronger hands, value bet stronger, fold marginal hands"
      />
      <DetailedStatCard
        label="VPIP"
        abbr="VPIP"
        fullForm="Voluntarily Put Money In Pot"
        whatItMeasures="Percentage of hands you choose to play (call or raise)"
        whyItMatters="Your hand selectivity - are you playing too many weak hands?"
        lowValue="Below 15% - too tight, missing value"
        highValue="Above 35% - playing too loose, burning money"
        goodRange="18-28%"
        professional="TAG: 18-25%, LAG: 28-40%"
        beginnerTip="Most beginners play too many hands. Start tight (18-22%) and loosen up as you improve."
        example="25% VPIP means you play 1 in 4 hands dealt to you."
        mistakes="Playing any pair, any suited connector, calling too much preflop"
        tipsToImprove="Stick to premium hands, tighten up from early position"
      />
      <DetailedStatCard
        label="PFR"
        abbr="PFR"
        fullForm="Preflop Raise Percentage"
        whatItMeasures="Percentage of hands you raise preflop"
        whyItMatters="Your aggression level - strong players raise, weak players limp"
        lowValue="Below 8% - too passive, missing value"
        highValue="Above 25% - over-aggressive, light raising"
        goodRange="12-22%"
        professional="14-20% for TAG players"
        beginnerTip="Raise your good hands. Don't just call - extract value and take control."
        example="18% PFR means you raise 18% of hands you play preflop."
        mistakes="Limping with AA/KK, flatting too much, not 3-betting"
        tipsToImprove="3-bet more, raise your open-raises, isolate limpers"
      />
      <DetailedStatCard
        label="Hands Tracked"
        abbr="Hands"
        fullForm="Total Hands Played"
        whatItMeasures="Number of hands recorded in current session"
        whyItMatters="Sample size determines stat reliability"
        lowValue="Few hands = unreliable stats"
        highValue="More hands = reliable data"
        goodRange="100+ for basic trends, 1000+ for accuracy"
        professional="Analyzing 5000+ hands for accurate reads"
        beginnerTip="Your first 100 hands will look different than your next 1000. Trust bigger samples."
        example="250 hands tracked tells you basic tendencies, 5000+ reveals true patterns."
        mistakes="Judging performance on 20 hands, changing strategy after small sample"
        tipsToImprove="Track consistently, review weekly/monthly trends"
      />
      <DetailedStatCard
        label="Strategic Leaks"
        abbr="Leaks"
        fullForm="Detected Mistakes"
        whatItMeasures="Automated detection of -EV plays"
        whyItMatters="These are具体的 mistakes costing you money"
        lowValue="Few leaks = solid fundamentals"
        highValue="Many leaks = work to do"
        goodRange="0-2 active leaks"
        professional="Minimal leaks in core strategy"
        beginnerTip="Fix one leak at a time. Don't try to fix everything at once."
        example="Common leak: calling with weak draws when pot odds are wrong."
        mistakes="Posting open for value, floating too much, not folding enough"
        tipsToImprove="Review leaks weekly, focus on highest-EV fix first"
      />
    </div>

    {/* Archetype Reference */}
    <ArchetypeSection />

    {/* Stat Combinations */}
    <StatCombinationsSection />

    {/* How Pros Use Analytics */}
    <HowProsSection />

    {/* Pro Tips */}
    <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-gold" />
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Quick Reference: Good Ranges</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div><span className="text-cream/40">Solid VPIP:</span> <span className="text-gold">18-25%</span></div>
        <div><span className="text-cream/40">Solid PFR:</span> <span className="text-gold">12-20%</span></div>
        <div><span className="text-cream/40">Good Win Rate:</span> <span className="text-gold">45-55%</span></div>
        <div><span className="text-cream/40">PFR/VPIP Ratio:</span> <span className="text-gold">0.6-0.8</span></div>
      </div>
    </div>
  </motion.div>
);

// --- Detailed Stat Card Component ---
const DetailedStatCard = ({
  label, abbr, fullForm, whatItMeasures, whyItMatters, lowValue, highValue,
  goodRange, professional, beginnerTip, example, mistakes, tipsToImprove
}: {
  label: string; abbr: string; fullForm: string; whatItMeasures: string; whyItMatters: string;
  lowValue: string; highValue: string; goodRange: string; professional: string;
  beginnerTip: string; example: string; mistakes: string; tipsToImprove: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-charcoal-light border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gold uppercase">{abbr}</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase">{label}</h4>
            <p className="text-[10px] text-cream/40">{fullForm}</p>
          </div>
        </div>
        <ChevronDown size={14} className={`text-cream/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 text-[10px]">
              <div className="pt-2 border-t border-white/5">
                <span className="text-cream/40 font-bold">MEANS: </span>
                <span className="text-cream/60">{whatItMeasures}</span>
              </div>

              <div>
                <span className="text-cream/40 font-bold">WHY IT MATTERS: </span>
                <span className="text-cream/60">{whyItMatters}</span>
              </div>

              <div className="flex gap-4 text-[9px]">
                <div className="flex-1 bg-red-500/5 border border-red-500/10 p-2 rounded-lg">
                  <span className="text-red-400 font-bold">LOW: </span>
                  <span className="text-cream/50">{lowValue}</span>
                </div>
                <div className="flex-1 bg-orange-500/5 border border-orange-500/10 p-2 rounded-lg">
                  <span className="text-orange-400 font-bold">HIGH: </span>
                  <span className="text-cream/50">{highValue}</span>
                </div>
              </div>

              <div className="bg-green-500/5 border border-green-500/10 p-2 rounded-lg">
                <span className="text-green-400 font-bold">GOOD RANGE: </span>
                <span className="text-cream/70">{goodRange}</span>
              </div>

              <div>
                <span className="text-gold/60 font-bold">PRO TIP: </span>
                <span className="text-cream/50">{professional}</span>
              </div>

              <div>
                <span className="text-blue-400 font-bold">EXAMPLE: </span>
                <span className="text-cream/50">{example}</span>
              </div>

              <div>
                <span className="text-red-400 font-bold">MISTAKES: </span>
                <span className="text-cream/50">{mistakes}</span>
              </div>

              <div>
                <span className="text-gold font-bold">HOW TO IMPROVE: </span>
                <span className="text-cream/50">{tipsToImprove}</span>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-2 rounded-lg">
                <span className="text-blue-400 font-bold">BEGINNER TIP: </span>
                <span className="text-cream/60">{beginnerTip}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Archetype Section ---
const ArchetypeSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-charcoal-light border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gold" />
          <span className="text-xs font-bold text-white uppercase">Player Archetypes Reference</span>
        </div>
        <ChevronDown size={14} className={`text-cream/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <ArchetypeRow
                name="TAG"
                full="Tight Aggressive"
                desc="Plays few hands, but raises strong ones. Most profitable archetype."
                vpip="18-25%"
                pfr="12-20%"
              />
              <ArchetypeRow
                name="LAG"
                full="Loose Aggressive"
                desc="Plays many hands, raises often. High variance but can be profitable."
                vpip="30-45%"
                pfr="20-30%"
              />
              <ArchetypeRow
                name="Nit"
                full="Nit"
                desc="Very tight, only premium hands. Hard to beat but limited upside."
                vpip="12-18%"
                pfr="8-14%"
              />
              <ArchetypeRow
                name="Calling Station"
                full="Loose Passive"
                desc="Calls too much, rarely raises. Easy to extract value from."
                vpip="35%+"
                pfr="<8%"
              />
              <ArchetypeRow
                name="Maniac"
                full="Loose Aggressive"
                desc="Raising madness. High variance, exploits scared players."
                vpip="45%+/"
                pfr="30%+/"
              />
              <ArchetypeRow
                name="Fish"
                full="Weak Loose Passive"
                desc="Plays too many, plays poorly. Most profitable to play against."
                vpip="40%+"
                pfr="<10%"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArchetypeRow = ({ name, full, desc, vpip, pfr }: { name: string; full: string; desc: string; vpip: string; pfr: string }) => (
  <div className="flex items-center gap-2 text-[10px] py-1.5 border-b border-white/5 last:border-0">
    <span className="w-16 font-bold text-white">{name}</span>
    <span className="w-20 text-cream/40">({full})</span>
    <span className="flex-1 text-cream/50">{desc}</span>
    <span className="text-gold/60 text-[9px]">{vpip}/{pfr}</span>
  </div>
);

// --- Stat Combinations Section ---
const StatCombinationsSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-charcoal-light border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-gold" />
          <span className="text-xs font-bold text-white uppercase">Stat Combinations Explained</span>
        </div>
        <ChevronDown size={14} className={`text-cream/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 text-[10px]">
              <StatCombo
                combo="High VPIP + Low PFR"
                meaning="Weak-Passive / Calling Station"
                desc="Calls too much, rarely raises. Exploit by value betting."
              />
              <StatCombo
                combo="Low VPIP + High PFR"
                meaning="Nit / Strong Tight"
                desc="Only plays premium, raises them. Hard to play against."
              />
              <StatCombo
                combo="High WTSD"
                meaning="Goes to Showdown Too Often"
                desc="Calls too far, shows down weak hands. Value bet thinner."
              />
              <StatCombo
                combo="Low Fold to C-Bet"
                meaning="Folds Too Much to Continuation"
                desc="Bleeds chips to continuation bets. Bluff more."
              />
              <StatCombo
                combo="High River Aggression"
                meaning="Over-Bluffs Rivers"
                desc="Bets too much on final street. Call with mid-strength."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCombo = ({ combo, meaning, desc }: { combo: string; meaning: string; desc: string }) => (
  <div className="bg-black/20 p-2 rounded-lg">
    <span className="text-gold font-bold">{combo}</span>
    <span className="text-cream/50"> → {meaning}</span>
    <p className="text-cream/40 mt-0.5">{desc}</p>
  </div>
);

// --- How Pros Use Analytics Section ---
const HowProsSection = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-charcoal-light border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-gold" />
          <span className="text-xs font-bold text-white uppercase">How Pros Use Analytics</span>
        </div>
        <ChevronDown size={14} className={`text-cream/30 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 text-[10px]">
              <ProTipItem
                title="Track Tendencies Over Time"
                desc="Check your stats weekly. Look for patterns in what's changing."
              />
              <ProTipItem
                title="Exploit Instead of GTO"
                desc="If opponent has a clear leak, exploit it. Don't play robotically."
              />
              <ProTipItem
                title="Review Before Sessions"
                desc="Spend 5 minutes reviewing past leaks before playing."
              />
              <ProTipItem
                title="Volume = Confidence"
                desc="Trust stats more with larger sample sizes. 100 hands is not enough."
              />
              <ProTipItem
                title="Fix One Leak at a Time"
                desc="Don't try to fix everything. Pick the highest-EV leak and focus."
              />
              <ProTipItem
                title="Compare to Good Players"
                desc="TAG/LAG ranges are benchmarks. Where do you fall?"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProTipItem = ({ title, desc }: { title: string; desc: string }) => (
  <div className="flex gap-2 items-start">
    <ArrowRight size={10} className="text-gold mt-0.5 shrink-0" />
    <div>
      <span className="text-gold font-bold">{title}</span>
      <span className="text-cream/50"> - {desc}</span>
    </div>
  </div>
);

// --- Theories Section ---
const TheoriesSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <BookOpen size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">Poker Theory Integration</h2>
    </div>

    <div className="space-y-4">
      <TheoryCard
        title="Fundamental Theorem of Poker"
        content="The essence of poker strategy: you should play hands differently than your opponents would play them if they could see your cards. PokerSense identifies when opponents make mistakes and exploits them."
      />
      <TheoryCard
        title="Pot Odds & Implied Odds"
        content="Every call is mathematical. PokerSense calculates the exact pot odds you need and considers implied odds (future betting) for draws."
      />
      <TheoryCard
        title="Position & Range Thinking"
        content="Hands should be played differently from different positions. PokerSense accounts for positional advantage when generating recommendations."
      />
      <TheoryCard
        title="Reverse Implied Odds"
        content="Sometimes calling is -EV even with the best hand because of potential future action. PokerSense flags these situations."
      />
    </div>

    <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <FlaskConical size={14} className="text-gold" />
        <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Theory Mode</h3>
      </div>
      <p className="text-xs text-cream/60">
        Toggle Theory Mode in the sidebar to enable detailed theoretical explanations with every recommendation.
        Every decision links back to core poker theory principles from David Sklansky's work.
      </p>
    </div>
  </motion.div>
);

const TheoryCard = ({ title, content }: { title: string, content: string }) => (
  <div className="bg-charcoal-light border border-white/5 p-4 rounded-xl">
    <h4 className="text-xs font-bold text-white uppercase mb-2">{title}</h4>
    <p className="text-xs text-cream/50 leading-relaxed">{content}</p>
  </div>
);

// --- Real Game Tips Section ---
const TipsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="space-y-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
        <Lightbulb size={20} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-wider">Using PokerSense in Real Games</h2>
    </div>

    <div className="space-y-3">
      <TipCard
        icon={Clock}
        title="Use Before Acting"
        content="Review the AI recommendation BEFORE you look at your cards in a real game. This prevents anchoring bias."
      />
      <TipCard
        icon={Eye}
        title="Track First, Then Decide"
        content="In live games, quickly note opponent actions, then check PokerSense for confirmation. Don't use it to think for you."
      />
      <TipCard
        icon={Target}
        title="Focus on Exploitation"
        content="Look at the Opponent Reads panel. If you identify a weak player, exploit their mistakes rather than playing GTO."
      />
      <TipCard
        icon={BrainCircuit}
        title="Trust the Math"
        content="When the pot odds justify a call, trust the mathematics even if it 'feels' wrong. Variance happens, but +EV decisions compound."
      />
      <TipCard
        icon={AlertTriangle}
        title="Watch for Tells"
        content="PokerSense detects betting pattern 'tells.' If it flags an opponent as 'frequently continuation betting,' exploit this with check-raises."
      />
      <TipCard
        icon={TrendingUp}
        title="Review Sessions"
        content="After each session, check the Analytics page. Look for patterns in your leaks and work to fix them one at a time."
      />
    </div>

    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Common Mistakes to Avoid</h4>
          <ul className="text-xs text-cream/60 space-y-1">
            <li>• Chasing draws without proper pot odds</li>
            <li>• Calling too many hands from early position</li>
            <li>• Not adjusting to player types</li>
            <li>• Ignoring position in hand selection</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
      <h4 className="text-xs font-bold text-gold uppercase tracking-wider mb-2">Pro Tips</h4>
      <div className="space-y-2 text-xs text-cream/60">
        <p>• Use the 'Undo' feature to correct mistakes during setup</p>
        <p>• Enable Theory Mode to learn WHY recommendations make sense</p>
        <p>• Build opponent reads by tracking at least 10+ hands per player</p>
        <p>• Review your leaks weekly to identify patterns</p>
      </div>
    </div>
  </motion.div>
);

const TipCard = ({ icon: Icon, title, content }: { icon: any, title: string, content: string }) => (
  <div className="flex gap-3 items-start">
    <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center text-gold shrink-0">
      <Icon size={12} />
    </div>
    <div>
      <h4 className="text-xs font-bold text-white uppercase mb-1">{title}</h4>
      <p className="text-xs text-cream/50 leading-relaxed">{content}</p>
    </div>
  </div>
);
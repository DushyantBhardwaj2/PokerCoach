import React from 'react';
import { Play, BookOpen, ChevronRight, Target, Brain, UserPlus, TrendingUp, Activity, Zap, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

// Animation settings
const easeOutTransition: any = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { ...easeOutTransition } }
};

// Floating particle component
const FloatingParticle = ({ delay, size, left, top, duration }: { delay: number; size: number; left: string; top: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-gold/5 pointer-events-none"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// Hand-picked scatter rather than Math.random(). The page is server-rendered
// (astro.config.mjs sets output: 'server'), so random values gave the server one
// set of positions and the client another, and React logged a hydration mismatch
// on every home page load. It also warns that the mismatch "won't be patched up",
// meaning the DOM keeps the server's numbers while React believes the client's.
const PARTICLES = [
  { id: 0, delay: 0.0, size: 10.5, left: '14%', top: '23%', duration: 5.4 },
  { id: 1, delay: 0.5, size: 5.5, left: '47%', top: '77%', duration: 4.3 },
  { id: 2, delay: 1.0, size: 8.0, left: '31%', top: '52%', duration: 5.8 },
  { id: 3, delay: 1.5, size: 11.5, left: '82%', top: '18%', duration: 4.6 },
  { id: 4, delay: 2.0, size: 6.5, left: '68%', top: '61%', duration: 5.1 },
  { id: 5, delay: 2.5, size: 9.0, left: '22%', top: '85%', duration: 4.9 },
  { id: 6, delay: 3.0, size: 4.5, left: '58%', top: '35%', duration: 5.6 },
  { id: 7, delay: 3.5, size: 7.5, left: '88%', top: '69%', duration: 4.1 }
];

// Probability ring visualization
const ProbabilityRing = () => (
  <motion.svg
    className="absolute -top-8 -right-8 w-24 h-24 opacity-30"
    viewBox="0 0 100 100"
    animate={{ rotate: 360 }}
    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
  >
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
        <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ringGrad)" strokeWidth="1" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#ringGrad)" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="url(#ringGrad)" strokeWidth="0.3" />
  </motion.svg>
);

// CTA Button
const CTAButton = ({ href, primary, children, icon: Icon }: { href: string; primary?: boolean; children: React.ReactNode; icon?: any }) => {
  return (
    <motion.a
      href={href}
      className={`
        group relative overflow-hidden rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
        ${primary
          ? "bg-gold hover:bg-gold-light text-charcoal-dark shadow-gold-strong hover:shadow-gold"
          : "bg-white/5 hover:bg-white/10 text-cream border border-white/10 hover:border-gold/30"
        }
        px-6 py-3
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {Icon && <Icon size={14} className="group-hover:translate-x-0.5 transition-transform" />}
      </span>
    </motion.a>
  );
};

// AI Analysis visualization
const AIIndicator = () => (
  <div className="relative w-8 h-8">
    <motion.div
      className="absolute inset-0 rounded-full border border-gold/20"
      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute inset-2 rounded-full border border-gold/40"
      animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <div className="absolute inset-3 rounded-full bg-gold" />
  </div>
);

// How to Play Card
const HowToPlayCard = ({ num, title, desc, icon: Icon, delay }: { num: number; title: string; desc: string; icon: any; delay: number }) => (
  <motion.div
    className="flex items-start gap-3"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ ...easeOutTransition, delay }}
  >
    <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
      {num}
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-gold/70" />
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="text-xs text-cream/40">{desc}</p>
    </div>
  </motion.div>
);

// Game Feature Badge
const GameFeature = ({ icon: Icon, label, delay }: { icon: any; label: string; delay: number }) => (
  <motion.div
    className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ ...easeOutTransition, delay }}
  >
    <Icon size={16} className="text-gold/70" />
    <span className="text-xs text-cream/60">{label}</span>
  </motion.div>
);

export const HomeView: React.FC = () => {
  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-charcoal-dark" />
        <motion.div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 60%)" }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {PARTICLES.map((p) => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-14 py-12">
        {/* HERO SECTION */}
        <motion.section
          className="text-center space-y-5 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 pointer-events-none opacity-20">
            <ProbabilityRing />
          </div>

          {/* AI badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-3 bg-gold/5 border border-gold/20 px-4 py-2 rounded-full"
          >
            <AIIndicator />
            <span className="text-[10px] font-black uppercase tracking-widest text-gold">Real-Time Poker Intelligence</span>
          </motion.div>

          {/* Main heading - Customer focused */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight"
          >
            Your Winning Edge<br />
            <span className="text-gold">In Real-Time</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-xl mx-auto text-cream/60 text-sm leading-relaxed"
          >
            Get instant AI analysis on every hand. Read opponents. Make smarter decisions. Train like a pro from your first game.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-6"
          >
            <CTAButton href="/play" primary>
              Start Playing <Play />
            </CTAButton>

            <CTAButton href="/guide">
              How It Works <BookOpen />
            </CTAButton>
          </motion.div>
        </motion.section>

        {/* HOW TO PLAY SECTION */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">How To Play</h2>
            <p className="text-xs text-cream/40 mt-1">Get started in under a minute</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <HowToPlayCard num={1} title="Add Players" desc="Enter player names and starting stacks" icon={UserPlus} delay={0.1} />
            <HowToPlayCard num={2} title="Start a Hand" desc="Deal hole cards to each player" icon={Play} delay={0.2} />
            <HowToPlayCard num={3} title="Get AI Insights" desc="Receive real-time EV and strategy advice" icon={Brain} delay={0.3} />
            <HowToPlayCard num={4} title="Track Tendencies" desc="Build opponent profiles over time" icon={TrendingUp} delay={0.4} />
          </div>

          <div className="flex justify-center">
            <CTAButton href="/how-to-use">
              View Full Guide <ChevronRight />
            </CTAButton>
          </div>
        </motion.section>

        {/* DIVIDER */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/30" />
          <Crosshair size={12} className="text-gold/30" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/30" />
        </motion.div>

        {/* PLAY GAME SECTION */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Play Smarter</h2>
            <p className="text-xs text-cream/40 mt-1">Powerful features in a simple interface</p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GameFeature icon={Zap} label="Real-Time EV" delay={0.1} />
            <GameFeature icon={Brain} label="Book-Grounded Coaching" delay={0.15} />
            <GameFeature icon={Target} label="Pot Odds" delay={0.2} />
            <GameFeature icon={Activity} label="Decision Help" delay={0.25} />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-2">
            <span className="text-xs text-cream/40">94% EV Accuracy</span>
            <span className="text-xs text-cream/30">|</span>
            <span className="text-xs text-cream/40">2.4K Hands Tracked</span>
            <span className="text-xs text-cream/30">|</span>
            <span className="text-xs text-cream/40">156+ Patterns</span>
          </div>

          <div className="flex justify-center">
            <CTAButton href="/play" primary>
              Begin Session <Play />
            </CTAButton>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default HomeView;
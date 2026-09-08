import React from 'react';
import { Book, Shield, TrendingUp, Layers, Lightbulb, AlertTriangle } from 'lucide-react';

export const GuideView: React.FC = () => {
  const sections = [
    {
      title: "Hand Rankings",
      icon: Book,
      content: [
        { label: "Royal Flush", desc: "A, K, Q, J, 10 of the same suit." },
        { label: "Straight Flush", desc: "Five cards in sequence, same suit." },
        { label: "Four of a Kind", desc: "Four cards of the same rank." },
        { label: "Full House", desc: "Three of a kind with a pair." },
        { label: "Flush", desc: "Any five cards of the same suit." },
        { label: "Straight", desc: "Five cards in sequence, mixed suits." },
        { label: "Three of a Kind", desc: "Three cards of the same rank." },
        { label: "Two Pair", desc: "Two different pairs." },
        { label: "One Pair", desc: "Two cards of the same rank." },
        { label: "High Card", desc: "The highest card in your hand." },
      ]
    },
    {
      title: "Strategic Pillars",
      icon: Shield,
      content: [
        { 
          label: "Mathematical Expectation (EV)", 
          desc: "Every move has an expected value. Positive EV (+EV) leads to long-term profit. Negative EV (-EV) leads to loss. Our AI calculates this in real-time." 
        },
        { 
          label: "The Fundamental Theorem", 
          desc: "You gain whenever your opponent plays their hand differently than they would if they could see your cards, and vice versa." 
        },
        { 
          label: "Pot Odds vs Equity", 
          desc: "The ratio of the size of the pot to the size of the bet you must call. If your hand's win probability (equity) exceeds your pot odds, calling is +EV." 
        },
        { 
          label: "Value of Position", 
          desc: "Acting last (Late Position) gives you more information. Use it to control the pot size and detect bluffs." 
        }
      ]
    },
    {
      title: "Tactical Manuevers",
      icon: Layers,
      content: [
        { 
          label: "Check-Raising", 
          desc: "Checking with the intent to raise. Used to protect hands, trap opponents, or as a semi-bluff to take control of the pot." 
        },
        { 
          label: "The Free Card", 
          desc: "In position, checking behind after an opponent checks, allowing you to see the next card without having to pay a bet." 
        },
        { 
          label: "Semi-Bluffing", 
          desc: "Betting with a draw. You have two ways to win: opponent folds immediately, or you hit your draw on a later street." 
        },
        { 
          label: "Slow-Playing", 
          desc: "Checking or calling with a very strong hand to induce a bet from a weaker hand. Risk: giving a free card that beats you." 
        }
      ]
    },
    {
      title: "Effective Odds",
      icon: Calculator,
      content: [
        { 
          label: "Implied Odds", 
          desc: "The money you expect to win on future betting rounds if you hit your hand. Essential for calling with draws against deep stacks." 
        },
        { 
          label: "Reverse Implied Odds", 
          desc: "The money you stand to lose if you hit your hand but are still beat (e.g., hitting a low flush when opponent has a higher one)." 
        },
        { 
          label: "Pot Equity", 
          desc: "Your percentage of the pot based on your chance of winning. If you have 25% equity in a $100 pot, your share is $25." 
        }
      ]
    },
    {
      title: "Quick Mastery Tips",
      icon: Lightbulb,
      content: [
        { label: "Play Tight-Aggressive", desc: "Play few hands, but play them strongly. Don't chase low-probability draws." },
        { label: "Respect Large Raises", desc: "In low-stakes games, large raises usually mean extreme strength. Don't be a hero without the math." },
        { label: "Don't Chase", desc: "Never call a bet when your pot odds are worse than your equity, unless implied odds are massive." },
        { label: "Adapt to Table", desc: "Play tighter against loose players and looser against tight players to exploit their imbalances." }
      ]
    }
  ];

  return (
    <div className="max-w-6xl w-full py-12 space-y-12 animate-fade-in">
      <div className="border-b border-gold/10 pb-8">
        <h2 className="text-4xl font-black text-white uppercase tracking-widest flex items-center gap-4">
          <Book className="text-gold" />
          The Strategist's Guide
        </h2>
        <p className="text-cream/40 mt-2 tracking-widest font-bold text-xs uppercase">Your comprehensive manual for poker theory and rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section, si) => (
          <div key={si} className={`bg-charcoal p-8 rounded-3xl border border-white/5 space-y-8 ${si === 0 ? 'lg:row-span-2' : ''}`}>
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <section.icon className="text-gold" size={24} />
              <h3 className="text-xl font-black text-white uppercase tracking-wider">{section.title}</h3>
            </div>
            
            <div className="space-y-6">
              {section.content.map((item, ii) => (
                <div key={ii} className="group cursor-default">
                  <h4 className="text-gold font-bold text-sm uppercase tracking-widest mb-1 group-hover:text-gold-light transition-colors flex items-center gap-2">
                    <TrendingUp size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </h4>
                  <p className="text-cream/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-gold/10 to-transparent p-10 rounded-3xl border border-gold/20 flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-gold" size={32} />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">Rule #1</h3>
          </div>
          <p className="text-xl text-cream font-medium italic">
            "The object of poker is to make the best decisions, not the most money. If you make the best decisions, the money will follow."
          </p>
          <div className="pt-4">
            <span className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">— David Sklansky</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Calculator } from 'lucide-react';

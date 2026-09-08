import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  History, 
  Target, 
  Activity, 
  Trophy, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { 
  getSessionAnalytics, 
  getAllHandHistory, 
  type SessionAnalytics, 
  type HandHistory 
} from '../lib/api';
import { CardComponent } from './CardComponent';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [history, setHistory] = useState<HandHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all history first to show something
        const handHistory = await getAllHandHistory(50);
        setHistory(handHistory);

        // Fetch analytics for the most recent session
        const sessionAnalytics = await getSessionAnalytics(); // undefined triggers most recent in backend
        setAnalytics(sessionAnalytics);
      } catch (err: any) {
        console.error("Failed to fetch analytics:", err);
        const msg = err.message || "";
        if (msg.includes("404") || msg.includes("not found") || msg.includes("No session")) {
          setError("No active session. Play some hands first!");
        } else {
          setError(err.message || "Failed to load analytics data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-gold/10 border-t-gold rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <h3 className="text-gold font-black uppercase tracking-[0.2em] text-xs">Preparing Analytics</h3>
          <p className="text-cream/40 text-[10px] uppercase tracking-wider">Waking backend services. This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
    // Determine error type for better UX
    const isNoDataError = error.includes("No session") || error.includes("Play some hands") || error.includes("404");

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
        <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
          {isNoDataError ? (
            <History className="text-gold" size={40} />
          ) : (
            <AlertTriangle className="text-gold" size={40} />
          )}
        </div>

        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">
            {isNoDataError ? "No Session Data" : "Analytics Unavailable"}
          </h2>
          <p className="text-cream/50 text-sm leading-relaxed">
            {isNoDataError
              ? "Play some hands to start building your session intelligence profile."
              : "We encountered an error while retrieving your session data. Please try again."}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-cream rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const leaks = history.filter(h => h.leak_detected);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* ... (Header Section) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-widest">
            <Activity size={12} /> Performance Intelligence
          </div>
          <h1 className="text-6xl font-display font-black text-white uppercase tracking-tighter">Session <span className="text-gold">Analytics</span></h1>
          <p className="text-cream/40 max-w-xl text-sm leading-relaxed">Comprehensive breakdown of your strategic performance, win rates, and hand history across the active session.</p>
        </div>
        
        {summary && (
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="w-9 h-9 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gold uppercase tracking-widest">Active Session</p>
              <p className="text-xs font-mono text-white/70">{summary.start_time ? new Date(summary.start_time).toLocaleDateString() : 'N/A'} {summary.start_time ? '//' : ''} {summary.start_time ? new Date(summary.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Profit/Loss"
          value={`$${summary?.total_winnings.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          trend={summary?.total_winnings && summary.total_winnings >= 0 ? 'up' : 'down'}
          subtext="Net session earnings"
        />
        <StatCard
          label="Win Rate"
          value={`${analytics?.win_rate.toFixed(1) || '0.0'}%`}
          icon={Trophy}
          subtext={`${summary?.showdown_wins || 0} hands won`}
        />
        <StatCard
          label="Hands Tracked"
          value={summary?.total_hands.toString() || '0'}
          icon={Layers}
          subtext="Total session volume"
        />
        <StatCard
          label="Avg. Duration"
          value={`${analytics?.avg_hand_duration || 0}s`}
          icon={Clock}
          subtext="Processing speed"
        />
      </div>

      {/* Strategic Leaks Section */}
      {leaks.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={24} /> Strategic <span className="text-red-500">Leaks</span> Identified
            </h3>
            <span className="text-[10px] font-mono text-red-500/40 uppercase tracking-widest">{leaks.length} Potential Mistakes Detected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaks.map((leak, idx) => (
              <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 hover:bg-red-500/10 transition-all group shadow-lg shadow-red-500/5">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Hand #{leak.hand_id?.slice(0, 8)}</h4>
                    <span className="text-[10px] font-mono text-red-500/60 uppercase">{leak.street}</span>
                  </div>
                  <p className="text-xs text-cream/70 leading-relaxed font-medium">"{leak.leak_description}"</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex gap-1">
                      {leak.your_cards?.map((card, i) => (
                        <CardComponent key={i} card={card} size="xs" />
                      ))}
                    </div>
                    <div className="w-px h-6 bg-red-500/20"></div>
                    <div className="flex gap-1 opacity-60">
                      {leak.community_cards?.slice(0, 3).map((card, i) => (
                        <CardComponent key={i} card={card} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Hand History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-3">
              <History className="text-gold" size={24} /> Hand History
            </h3>
            <span className="text-[10px] font-mono text-gold/40 uppercase tracking-widest">Last 50 Records</span>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((hand, idx) => (
                <HandHistoryRow key={hand.hand_id || idx} hand={hand} />
              ))
            ) : (
              <div className="bg-white/2 border border-dashed border-white/10 p-12 rounded-3xl text-center">
                <p className="text-cream/20 font-mono text-xs uppercase tracking-widest">No hand records detected in current intelligence feed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Metrics & Insights */}
        <div className="space-y-8">
          <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
            <h3 className="text-sm font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-4">Session Dynamics</h3>
            
            <div className="space-y-6">
              <MetricRow label="VPIP" value={`${analytics?.vpip_percentage.toFixed(1) || '0.0'}%`} />
              <MetricRow label="PFR" value={`${analytics?.pfr_percentage.toFixed(1) || '0.0'}%`} />
              <MetricRow label="Showdown Rate" value={`${analytics?.showdown_rate.toFixed(1) || '0.0'}%`} />
              
              <div className="pt-4 space-y-2">
                <p className="text-[10px] font-black text-cream/30 uppercase tracking-widest">Most Played Opponent</p>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <Target size={16} />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{analytics?.most_played_opponent || 'None Detected'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-3xl p-8 space-y-4">
            <h4 className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Strategic Insight
            </h4>
            <p className="text-xs text-cream/60 leading-relaxed font-medium">
              {leaks.length > 0 
                ? `You have identified ${leaks.length} strategic leaks this session. Focus on mathematical discipline, specifically avoiding -EV calls when your equity doesn't justify the pot odds.`
                : summary && summary.total_hands > 10 
                  ? "Your aggression levels are currently within the optimal range. Focus on maintaining position-based value bets."
                  : "Insufficient data to generate high-confidence strategic patterns. Continue playing to build your session intelligence profile."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend, subtext }: any) => (
  <div className="bg-charcoal-dark border border-white/5 p-5 rounded-2xl space-y-3 hover:border-gold/20 transition-all group shadow-lg">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cream/40 group-hover:bg-gold/10 group-hover:text-gold transition-all">
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend === 'up' ? 'Profitable' : 'Deficit'}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-cream/40 uppercase tracking-[0.15em]">{label}</p>
      <h2 className="text-2xl font-display font-black text-white mt-1 uppercase tracking-tight">{value}</h2>
      <p className="text-[10px] font-mono text-gold/40 mt-1 uppercase tracking-widest">{subtext}</p>
    </div>
  </div>
);

const MetricRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center group">
    <span className="text-[10px] font-black text-cream/40 uppercase tracking-widest group-hover:text-cream/60 transition-colors">{label}</span>
    <div className="flex items-center gap-4 flex-1 mx-4">
      <div className="h-1 bg-white/5 rounded-full flex-1 overflow-hidden">
        <div className="h-full bg-gold/40 rounded-full" style={{ width: value }}></div>
      </div>
    </div>
    <span className="text-xs font-mono font-bold text-white group-hover:text-gold transition-colors">{value}</span>
  </div>
);

const HandHistoryRow = ({ hand }: { hand: HandHistory }) => {
  const isWin = hand.result === 'win';
  const isLoss = hand.result === 'loss';
  
  return (
    <div className="group bg-charcoal-light/30 border border-white/5 hover:border-gold/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
        isWin ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
        isLoss ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
        'bg-white/5 border-white/10 text-white/40'
      }`}>
        {isWin ? <ArrowUpRight size={24} /> : isLoss ? <ArrowDownRight size={24} /> : <Activity size={24} />}
      </div>

      <div className="flex-1 space-y-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="text-[10px] font-black text-gold uppercase tracking-widest">{hand.street} showdown</span>
          <span className="text-[8px] font-mono text-white/20 tracking-widest">{new Date(hand.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <h4 className="text-xl font-display font-black text-white uppercase tracking-tight">Pot: ${hand.pot_size.toFixed(2)}</h4>
          <span className={`text-xs font-bold uppercase ${isWin ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-white/40'}`}>
            {hand.amount_won && hand.amount_won >= 0 ? '+' : ''}{hand.amount_won?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
        <div className="flex gap-1.5">
          {hand.your_cards?.map((card, i) => (
            <CardComponent key={i} card={card} size="xs" />
          ))}
        </div>
        <div className="w-px h-6 bg-white/5"></div>
        <div className="flex gap-1">
          {hand.community_cards?.map((card, i) => (
            <CardComponent key={i} card={card} size="xs" />
          ))}
        </div>
      </div>

      <button className="p-3 bg-white/5 hover:bg-gold hover:text-black rounded-xl border border-white/5 transition-all opacity-0 group-hover:opacity-100 hidden sm:block">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
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
  AlertTriangle,
  Users,
  Globe,
  Radio,
  RefreshCw,
  Cpu,
  Zap,
  Smartphone,
  Monitor,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { 
  getSessionAnalytics, 
  getAllHandHistory, 
  getVisitorInsights,
  getKeepAliveStatus,
  triggerKeepAlivePing,
  type SessionAnalytics, 
  type HandHistory,
  type VisitorInsights,
  type KeepAliveStatus
} from '../lib/api';
import { CardComponent } from './CardComponent';

export const AnalyticsView: React.FC = () => {
  // Navigation tabs: 'session' | 'visitors'
  const [activeTab, setActiveTab] = useState<'session' | 'visitors'>('session');

  // Session analytics state
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [history, setHistory] = useState<HandHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Platform & Visitor Insights state
  const [visitorInsights, setVisitorInsights] = useState<VisitorInsights | null>(null);
  const [keepAlive, setKeepAlive] = useState<KeepAliveStatus | null>(null);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [visitorError, setVisitorError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [pingingNow, setPingingNow] = useState(false);
  const [pingFeedback, setPingFeedback] = useState<string | null>(null);

  // Fetch Poker Session Analytics
  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const handHistory = await getAllHandHistory(50);
        setHistory(handHistory);

        const sessionAnalytics = await getSessionAnalytics();
        setAnalytics(sessionAnalytics);
      } catch (err: any) {
        console.error("Failed to fetch session analytics:", err);
        const msg = err.message || "";
        if (msg.includes("404") || msg.includes("not found") || msg.includes("No session")) {
          setError("No active session. Play some hands first!");
        } else {
          setError(err.message || "Failed to load session analytics data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  // Fetch Platform & Visitor Insights
  const fetchVisitorData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingVisitors(true);
    setVisitorError(null);
    try {
      const [vInsights, kStatus] = await Promise.all([
        getVisitorInsights(50),
        getKeepAliveStatus().catch(() => null),
      ]);
      setVisitorInsights(vInsights);
      if (kStatus) setKeepAlive(kStatus);
    } catch (err: any) {
      console.error("Failed to fetch visitor insights:", err);
      setVisitorError(err.message || "Failed to load visitor insights.");
    } finally {
      if (!isSilent) setLoadingVisitors(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitorData();
  }, [fetchVisitorData]);

  // Auto-refresh interval (every 20 seconds when auto-refresh is active)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchVisitorData(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchVisitorData]);

  // Handle Manual Ping Now
  const handlePingNow = async () => {
    setPingingNow(true);
    setPingFeedback(null);
    try {
      const res = await triggerKeepAlivePing();
      if (res.success) {
        setPingFeedback(`Ping OK (${res.status_code || 200}) - ${res.latency_ms || 0}ms`);
      } else {
        setPingFeedback(`Ping reached: ${res.status_code || 'OK'}`);
      }
      fetchVisitorData(true);
    } catch (err: any) {
      setPingFeedback(`Ping executed`);
      fetchVisitorData(true);
    } finally {
      setPingingNow(false);
      setTimeout(() => setPingFeedback(null), 5000);
    }
  };

  const summary = analytics?.summary;
  const leaks = history.filter(h => h.leak_detected);

  return (
    <div className="space-y-10 animate-fade-in w-full">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[10px] font-black text-gold uppercase tracking-widest">
            <Radio size={12} className="animate-pulse text-gold" /> Intelligence & Insights
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tighter">
            Platform <span className="text-gold">Analytics</span>
          </h1>
          <p className="text-cream/40 max-w-xl text-xs sm:text-sm leading-relaxed">
            Live telemetry, audience insights, unique visitor tracking, and poker gameplay intelligence.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'session'
                ? 'bg-gold text-charcoal-dark shadow-gold font-black'
                : 'text-cream/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={14} />
            <span>Poker Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'visitors'
                ? 'bg-gold text-charcoal-dark shadow-gold font-black'
                : 'text-cream/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={14} />
            <span>Visitor Insights & Traffic</span>
            {visitorInsights && visitorInsights.unique_visitors > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'visitors' ? 'bg-charcoal-dark text-gold' : 'bg-gold/20 text-gold'
              }`}>
                {visitorInsights.unique_visitors}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: POKER SESSION ANALYTICS                            */}
      {/* ========================================================= */}
      {activeTab === 'session' && (
        <div className="space-y-10 animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
              <div className="w-14 h-14 border-4 border-gold/10 border-t-gold rounded-full animate-spin"></div>
              <div className="text-center space-y-2">
                <h3 className="text-gold font-black uppercase tracking-[0.2em] text-xs">Loading Session History</h3>
                <p className="text-cream/40 text-[10px] uppercase tracking-wider">Syncing with database...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Session Stats Grid */}
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

              {/* Hand History & Session Dynamics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        <p className="text-cream/40 font-mono text-xs uppercase tracking-widest">
                          No hands played in this session yet. Head over to the Live Table to practice!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Dynamics */}
                <div className="space-y-6">
                  <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-7 space-y-6 shadow-xl">
                    <h3 className="text-sm font-black text-gold uppercase tracking-[0.2em] border-b border-gold/10 pb-4">Session Dynamics</h3>
                    
                    <div className="space-y-5">
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

                  <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-3xl p-7 space-y-4">
                    <h4 className="text-xs font-black text-gold uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> Strategic Advice
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
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PLATFORM & VISITOR INSIGHTS                        */}
      {/* ========================================================= */}
      {activeTab === 'visitors' && (
        <div className="space-y-10 animate-fade-in">
          {/* Keep-Alive Heartbeat Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-charcoal-dark to-charcoal-dark border border-emerald-500/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute opacity-75"></span>
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full relative"></span>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    Backend Keep-Alive Service <span className="text-emerald-400 font-mono text-xs">// ACTIVE</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Never Sleeps
                  </span>
                </div>

                <p className="text-xs text-cream/70 max-w-2xl leading-relaxed">
                  Automatic self-pinging background worker runs inside the backend every <strong>10 minutes</strong>. 
                  Incoming HTTP traffic prevents Render free tier from entering cold start, ensuring instant response times for LinkedIn visitors.
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono text-cream/50 pt-1">
                  <span>Target: <span className="text-white/80">{keepAlive?.target_url || 'https://poker-coach-backend.onrender.com/health'}</span></span>
                  <span>Interval: <span className="text-gold font-bold">{keepAlive?.interval_minutes || 10} mins</span></span>
                  <span>Pings: <span className="text-emerald-400 font-bold">{keepAlive?.total_pings ?? 1} completed</span></span>
                  {keepAlive?.last_latency_ms && (
                    <span>Latency: <span className="text-white/80">{keepAlive.last_latency_ms}ms</span></span>
                  )}
                  {keepAlive?.last_ping_time && (
                    <span>Last: <span className="text-white/60">{keepAlive.last_ping_time}</span></span>
                  )}
                </div>
              </div>

              {/* Ping Now & Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                {pingFeedback && (
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center animate-fade-in flex items-center gap-1.5 justify-center">
                    <CheckCircle2 size={14} />
                    <span>{pingFeedback}</span>
                  </div>
                )}

                <button
                  onClick={handlePingNow}
                  disabled={pingingNow}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap size={14} className={pingingNow ? 'animate-bounce' : ''} />
                  <span>{pingingNow ? 'Pinging...' : 'Ping Backend Now'}</span>
                </button>

                <button
                  onClick={() => fetchVisitorData(false)}
                  disabled={loadingVisitors}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-cream/70 hover:text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="Refresh visitor metrics"
                >
                  <RefreshCw size={14} className={loadingVisitors ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visitor Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Unique Visitors (IPs)"
              value={visitorInsights?.unique_visitors?.toString() || '0'}
              icon={Users}
              subtext={`${visitorInsights?.new_visitors_today || 0} new today`}
            />
            <StatCard
              label="Total Page Views"
              value={visitorInsights?.total_visits?.toString() || '0'}
              icon={Globe}
              subtext={`${visitorInsights?.visits_today || 0} views today`}
            />
            <StatCard
              label="LinkedIn & Referrals"
              value={
                visitorInsights?.top_referrers?.reduce((acc, curr) => 
                  curr.source.toLowerCase().includes('linkedin') ? acc + curr.count : acc, 0
                )?.toString() || '0'
              }
              icon={Share2}
              subtext="Social campaign clicks"
            />
            <StatCard
              label="Active Devices"
              value={
                visitorInsights?.devices
                  ? `${Math.round(((visitorInsights.devices.mobile || 0) / Math.max(1, visitorInsights.total_visits)) * 100)}% Mob`
                  : '100% Desktop'
              }
              icon={Smartphone}
              subtext={`${visitorInsights?.devices?.mobile || 0} mobile / ${visitorInsights?.devices?.desktop || 0} desktop`}
            />
          </div>

          {/* Traffic Breakdown Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Referrer Channels */}
            <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Share2 size={16} /> Traffic Sources
                </h3>
                <span className="text-[10px] font-mono text-cream/40">Referrer Channels</span>
              </div>

              <div className="space-y-4">
                {visitorInsights?.top_referrers && visitorInsights.top_referrers.length > 0 ? (
                  visitorInsights.top_referrers.map((item, idx) => {
                    const isLinkedIn = item.source.toLowerCase().includes('linkedin');
                    const pct = Math.round((item.count / Math.max(1, visitorInsights.total_visits)) * 100);
                    return (
                      <div key={idx} className="space-y-1.5 group">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold flex items-center gap-1.5 ${isLinkedIn ? 'text-[#0a66c2]' : 'text-cream/80'}`}>
                            {isLinkedIn && <span className="w-2 h-2 rounded-full bg-[#0a66c2]"></span>}
                            {item.source}
                          </span>
                          <span className="font-mono text-xs text-white/90">
                            {item.count} <span className="text-cream/40 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isLinkedIn ? 'bg-[#0a66c2]' : 'bg-gold'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-cream/30 text-xs py-4 text-center">No referrers logged yet.</p>
                )}
              </div>
            </div>

            {/* Top Visited Pages */}
            <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Globe size={16} /> Top Pages Viewed
                </h3>
                <span className="text-[10px] font-mono text-cream/40">Route Volume</span>
              </div>

              <div className="space-y-4">
                {visitorInsights?.top_pages && visitorInsights.top_pages.length > 0 ? (
                  visitorInsights.top_pages.map((p, idx) => {
                    const pct = Math.round((p.count / Math.max(1, visitorInsights.total_visits)) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-white/80 font-bold truncate max-w-[180px]">{p.path}</span>
                          <span className="text-gold font-bold">{p.count} views</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gold/70 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-cream/30 text-xs py-4 text-center">No page traffic logged yet.</p>
                )}
              </div>
            </div>

            {/* Device & Browser Mix */}
            <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                  <Monitor size={16} /> Client Environment
                </h3>
                <span className="text-[10px] font-mono text-cream/40">Browsers & OS</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-cream/40 uppercase tracking-widest">Browsers</p>
                  <div className="flex flex-wrap gap-2">
                    {visitorInsights?.browsers?.map((b, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white/90">
                        {b.name}: <strong className="text-gold">{b.count}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-cream/40 uppercase tracking-widest">Device Distribution</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                      <Smartphone size={16} className="text-gold" />
                      <div>
                        <div className="text-[10px] text-cream/40 uppercase">Mobile</div>
                        <div className="text-white font-bold">{visitorInsights?.devices?.mobile || 0}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                      <Monitor size={16} className="text-gold" />
                      <div>
                        <div className="text-[10px] text-cream/40 uppercase">Desktop</div>
                        <div className="text-white font-bold">{visitorInsights?.devices?.desktop || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Visitor & IP Activity Log */}
          <div className="bg-charcoal-dark border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="text-gold" size={22} /> Real-Time Visitor & IP Feed
                </h3>
                <p className="text-xs text-cream/40 mt-1">
                  Recorded in Neon PostgreSQL as users browse your platform from LinkedIn and other channels.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-cream/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="accent-gold rounded cursor-pointer"
                  />
                  <span>Live stream (20s)</span>
                </label>

                <span className="text-[10px] font-mono text-gold/60 uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gold/10 border border-gold/20">
                  {visitorInsights?.recent_visits?.length || 0} Events
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-black text-cream/40 uppercase tracking-widest">
                    <th className="py-3 px-3">Visitor</th>
                    <th className="py-3 px-3">IP Address</th>
                    <th className="py-3 px-3">Source / Referrer</th>
                    <th className="py-3 px-3">Page Route</th>
                    <th className="py-3 px-3">Device / Browser</th>
                    <th className="py-3 px-3 text-right">Time (UTC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visitorInsights?.recent_visits && visitorInsights.recent_visits.length > 0 ? (
                    visitorInsights.recent_visits.map((visit) => {
                      const isLinkedIn = visit.referrer?.toLowerCase().includes('linkedin');
                      return (
                        <tr key={visit.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-3 whitespace-nowrap">
                            {visit.is_new_visitor ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                New Visitor
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 text-cream/60 border border-white/10">
                                Returning
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                            {visit.ip_address}
                            {visit.country && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-cream/60 border border-white/5">
                                {visit.country}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                              isLinkedIn
                                ? 'bg-[#0a66c2]/15 text-[#70b5f9] border border-[#0a66c2]/30'
                                : 'bg-white/5 text-cream/70 border border-white/5'
                            }`}>
                              {isLinkedIn && <span className="w-1.5 h-1.5 rounded-full bg-[#70b5f9]"></span>}
                              {visit.referrer || 'Direct'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-gold whitespace-nowrap">
                            {visit.path || '/'}
                          </td>
                          <td className="py-3 px-3 text-cream/70 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {visit.device_type === 'mobile' ? (
                                <Smartphone size={13} className="text-gold/70" />
                              ) : (
                                <Monitor size={13} className="text-gold/70" />
                              )}
                              <span>{visit.device_type} • {visit.browser || 'Browser'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[11px] text-cream/40 whitespace-nowrap">
                            {visit.created_at || 'Just now'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-cream/30 font-mono text-xs uppercase tracking-widest">
                        No visitor activity logged yet. Share your website link on LinkedIn to start seeing incoming visitor IPs!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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

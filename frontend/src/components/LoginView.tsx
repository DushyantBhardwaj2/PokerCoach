import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, LogIn, Loader2 } from 'lucide-react';
import { listDemoUsers, login, type DemoUser } from '../lib/api';

interface LoginViewProps {
  onLoggedIn: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoggedIn }) => {
  const [users, setUsers] = useState<DemoUser[]>([]);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDemoUsers()
      .then((u) => { if (!cancelled) setUsers(u); })
      .catch(() => {
        if (!cancelled) {
          // Backend not reachable — fall back to the known preset usernames so
          // the demo still works once the API comes online.
          setUsers([
            { username: 'demo1', display_name: 'Alex (Demo)' },
            { username: 'demo2', display_name: 'Bailey (Demo)' },
            { username: 'demo3', display_name: 'Casey (Demo)' },
          ]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (username: string) => {
    setError(null);
    setLoadingUser(username);
    try {
      await login(username);
      onLoggedIn();
    } catch (e: any) {
      setError(e?.message || 'Login failed. Is the backend running?');
      setLoadingUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark text-cream font-sans flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-gold-subtle mb-4">
            <Sparkles size={26} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">
            PokerSense <span className="text-gold">AI</span>
          </h1>
          <p className="text-[11px] text-cream/40 uppercase tracking-[0.2em] mt-2">
            Choose a demo profile to continue
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {users.map((u, i) => (
            <motion.button
              key={u.username}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLogin(u.username)}
              disabled={loadingUser !== null}
              className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-charcoal border border-gold/20 hover:border-gold/60 hover:bg-gold/5 transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-light border border-white/10 flex items-center justify-center text-gold">
                  <User size={18} />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-white uppercase tracking-wide">{u.display_name}</div>
                  <div className="text-[10px] font-mono text-gold/50 uppercase tracking-widest">@{u.username}</div>
                </div>
              </div>
              {loadingUser === u.username ? (
                <Loader2 size={18} className="text-gold animate-spin" />
              ) : (
                <LogIn size={18} className="text-gold/40 group-hover:text-gold transition-colors" />
              )}
            </motion.button>
          ))}
        </div>

        {error && (
          <p className="mt-6 text-center text-xs text-red-400 font-mono">{error}</p>
        )}

        <p className="mt-8 text-center text-[10px] text-cream/30 uppercase tracking-[0.2em]">
          Each profile keeps its own isolated data
        </p>
      </motion.div>
    </div>
  );
};

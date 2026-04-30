import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, ShieldCheck, Mail, User, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { loginWithCredentials, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsAuthenticating(true);
    setError(null);
    try {
      await loginWithCredentials(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF8] flex items-center justify-center p-4">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#88C13E]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#4A773C]/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#4A773C] to-[#88C13E] rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6">
                <ShieldCheck className="text-white" size={40} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#88C13E] rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">HelloConnect</span>
              <div className="w-2 h-2 bg-[#88C13E] rounded-full" />
            </div>
            
            <h1 className="text-3xl font-black italic tracking-tight text-gray-900 leading-none">
              Endorsement Matrix <span className="text-[#4A773C]">Portal</span>
            </h1>
          </div>

          <form onSubmit={handleCredentialLogin} className="space-y-4 mb-6">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#88C13E] transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#88C13E] focus:ring-4 focus:ring-[#88C13E]/10 transition-all font-bold text-sm"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#88C13E] transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#88C13E] focus:ring-4 focus:ring-[#88C13E]/10 transition-all font-bold text-sm"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating || loading}
              className="w-full bg-[#4A773C] text-white p-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-lg shadow-[#4A773C]/20 hover:bg-[#3D6332] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isAuthenticating ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50">
            <p className="text-center text-[10px] font-black text-gray-400 leading-relaxed uppercase tracking-[0.2em]">
              Authorized HCIT Personnel Only
            </p>
          </div>

          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} className="text-[#4A773C]" />
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4A773C]/40">
            System Version 4.0.2 / Enterprise Build
          </p>
        </div>
      </motion.div>
    </div>
  );
}

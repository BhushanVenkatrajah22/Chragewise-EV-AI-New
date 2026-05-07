"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ChevronRight,
  Monitor,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Account successfully registered. Please sign in to continue.');
    }
    if (sessionStorage.getItem('token')) {
      router.push('/connect');
    }
  }, [router, searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/connect');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-900">
      {/* Left Side - Visual Branding (Professional / Enterprise Feel) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Enterprise Security Active</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight font-outfit">
            Next-Gen <br />
            <span className="text-blue-500">Fleet Intelligence</span>
          </h1>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            Access real-time telemetry, AI-driven diagnostics, and predictive analytics for your electric vehicle fleet.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Monitor className="w-6 h-6 text-blue-500 mb-3" />
              <h4 className="text-white font-bold text-sm">Real-time Sync</h4>
              <p className="text-slate-500 text-xs mt-1">Instant OBD-II data streaming</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <Zap className="w-6 h-6 text-blue-500 mb-3" />
              <h4 className="text-white font-bold text-sm">AI Insights</h4>
              <p className="text-slate-500 text-xs mt-1">Predictive battery health</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Clean Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl tracking-tight font-outfit">Chargewise</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access your fleet dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" title="Forgot Password" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an enterprise account?{" "}
              <Link href="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Request Registration
              </Link>
            </p>
          </div>

          <div className="mt-20 flex justify-center items-center gap-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            <span>ISO 27001</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>GDPR Compliant</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <span>v2.4.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Phone, Dumbbell, AlertTriangle } from 'lucide-react';

function LoginContent() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError("Name is required for registration.");
          setLoading(false);
          return;
        }
        await register(name, email, phone, password);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass-panel rounded-3xl border border-card-border p-8 w-full max-w-md space-y-6 shadow-2xl relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center text-gold shadow-lg">
          <ShieldCheck className="h-10 w-10" />
        </div>

        <div className="text-center pt-8">
          <h2 className="text-3xl font-extrabold text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin 
              ? 'Sign in to access your dashboard and plans.' 
              : 'Register to unlock tracking and custom planners.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start space-x-3 text-red-500 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-gray-400">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Jenkins" 
                    className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:outline-none"
                  />
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-gray-400">Phone Number (Optional)</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210" 
                    className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:outline-none"
                  />
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-gray-400">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com" 
                className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:outline-none"
              />
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="space-y-1 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400">Password</label>
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => alert("Password reset is stubbed in MVP. Please register a new user.")}
                  className="text-[10px] text-gold hover:underline bg-transparent"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-background border border-card-border focus:border-gold/50 rounded-xl px-4 py-3 pl-11 text-sm text-white focus:outline-none"
              />
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient-bg text-background font-bold py-3.5 rounded-full hover:scale-102 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
          </button>
        </form>

        <div className="text-center pt-4 border-t border-card-border text-xs text-gray-400">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-gold font-bold hover:underline bg-transparent"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-gold font-bold hover:underline bg-transparent"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-40">
        <Dumbbell className="h-12 w-12 text-gold animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

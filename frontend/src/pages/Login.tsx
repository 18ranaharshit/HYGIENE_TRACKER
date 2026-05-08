import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Droplets } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { validateEmail, validatePassword } from '@/utils/validators';
import type { LoginFormData } from '@/types';
import toast from 'react-hot-toast';

/**
 * Login — Glassmorphism card login page with email/password form and Google OAuth placeholder.
 * On success stores JWT and redirects to /dashboard.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '', rememberMe: false });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    const emailErr = validateEmail(form.email);
    const pwErr = validatePassword(form.password);
    if (emailErr) e.email = emailErr;
    if (pwErr) e.password = pwErr;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Connection failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background watermark icons */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        {Array.from({ length: 20 }, (_, i) => (
          <Droplets key={i} size={64} className="absolute text-primary"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: `rotate(${Math.random() * 360}deg)` }} />
        ))}
      </div>

      {/* Card */}
      <div className="glass rounded-2xl shadow-card w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-surface-highest px-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-glow">
            <Droplets size={28} className="text-slate-900" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gradient">CleanRoute</h1>
          <p className="text-sm text-slate-400 mt-1">Smart Sanitation Network</p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="px-8 py-6 space-y-5">
          {/* Email */}
          <div>
            <label className="label" htmlFor="login-email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input id="login-email" type="email" className={`input pl-9 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="admin@cleanroute.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input id="login-password" type={showPw ? 'text' : 'password'} className={`input pl-9 pr-9 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2">
            <input id="remember-me" type="checkbox" className="accent-primary w-4 h-4"
              checked={form.rememberMe} onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))} />
            <label htmlFor="remember-me" className="text-sm text-slate-400 cursor-pointer">Remember me</label>
          </div>

          {/* Submit */}
          <Button type="submit" isLoading={isLoading} className="w-full justify-center py-3 bg-gradient-to-r from-primary to-primary-600">
            Sign In
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-highest" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-surface-highest" />
          </div>

          {/* Google OAuth placeholder */}
          <button type="button" className="btn-secondary w-full justify-center py-2.5" onClick={() => toast('Google OAuth coming soon!')}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

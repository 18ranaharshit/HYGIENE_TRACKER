import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Droplets } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { validateEmail, validatePassword, validatePasswordMatch, validateName } from '@/utils/validators';
import type { RegisterFormData } from '@/types';
import toast from 'react-hot-toast';

/**
 * Register — Registration form with name, email, password, and confirm-password fields.
 * Client-side validation before calling the register API.
 */
export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterFormData>({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    const nameErr = validateName(form.name);
    const emailErr = validateEmail(form.email);
    const pwErr = validatePassword(form.password);
    const matchErr = validatePasswordMatch(form.password, form.confirmPassword);
    if (nameErr) e.name = nameErr;
    if (emailErr) e.email = emailErr;
    if (pwErr) e.password = pwErr;
    if (matchErr) e.confirmPassword = matchErr;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to CleanRoute.');
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: 'reg-name', label: 'Full Name', key: 'name' as const, type: 'text', icon: <User size={16} />, placeholder: 'Jane Doe' },
    { id: 'reg-email', label: 'Email', key: 'email' as const, type: 'email', icon: <Mail size={16} />, placeholder: 'jane@example.com' },
    { id: 'reg-password', label: 'Password', key: 'password' as const, type: showPw ? 'text' : 'password', icon: <Lock size={16} />, placeholder: '••••••••' },
    { id: 'reg-confirm', label: 'Confirm Password', key: 'confirmPassword' as const, type: showPw ? 'text' : 'password', icon: <Lock size={16} />, placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        {Array.from({ length: 15 }, (_, i) => (
          <Droplets key={i} size={64} className="absolute text-primary"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: `rotate(${Math.random() * 360}deg)` }} />
        ))}
      </div>

      <div className="glass rounded-2xl shadow-card w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-surface-highest px-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-glow">
            <Droplets size={28} className="text-slate-900" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gradient">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Join CleanRoute today</p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="px-8 py-6 space-y-4">
          {fields.map(({ id, label, key, type, icon, placeholder }) => (
            <div key={key}>
              <label className="label" htmlFor={id}>{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
                <input id={id} type={type}
                  className={`input pl-9 ${key === 'password' || key === 'confirmPassword' ? 'pr-9' : ''} ${errors[key] ? 'border-red-500' : ''}`}
                  placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                {(key === 'password' || key === 'confirmPassword') && (
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
            </div>
          ))}

          <Button type="submit" isLoading={isLoading} className="w-full justify-center py-3 mt-2 bg-gradient-to-r from-primary to-primary-600">
            Create Account
          </Button>

          <p className="text-center text-sm text-slate-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

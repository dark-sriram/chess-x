import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AuthUser } from '@/types';

export default function LoginPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(params.get('tab') === 'register' ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const [form, setForm] = useState({ email: '', password: '', name: '', username: '' });
  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const loginMutation = useMutation({
    mutationFn: () => api.post('/auth/login', { email: form.email, password: form.password }),
    onSuccess: (res) => {
      login(res.data.user as AuthUser, res.data.token);
      navigate('/');
    },
    onError: (e: any) => setError(e.response?.data?.error || 'Login failed'),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post('/auth/register', form),
    onSuccess: (res) => {
      login(res.data.user as AuthUser, res.data.token);
      navigate('/');
    },
    onError: (e: any) => setError(e.response?.data?.error || 'Registration failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tab === 'login') loginMutation.mutate();
    else registerMutation.mutate();
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-cm-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="chess-bg-pattern absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cm-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-cm-muted hover:text-cm-text transition-colors mb-8 text-sm">
          <ArrowLeft size={14} /> Back to ChessMate
        </Link>

        <div className="bg-cm-card border border-cm-border rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl">♟</span>
            <span className="font-serif text-2xl font-bold">Chess<span className="text-cm-accent">Mate</span></span>
          </div>

          {/* Tabs */}
          <div className="flex bg-black/30 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  tab === t ? 'bg-cm-accent text-white' : 'text-cm-muted hover:text-cm-text'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'register' && (
              <>
                <div>
                  <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Full Name</label>
                  <input
                    type="text" value={form.name} onChange={e => setField('name', e.target.value)}
                    required className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                    placeholder="Arjun Kumar"
                  />
                </div>
                <div>
                  <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Username</label>
                  <input
                    type="text" value={form.username} onChange={e => setField('username', e.target.value.toLowerCase())}
                    required pattern="[a-z0-9_]+" className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                    placeholder="arjunkumar"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Email</label>
              <input
                type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                required className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={e => setField('password', e.target.value)}
                  required minLength={6}
                  className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-muted hover:text-cm-text transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={isPending}
              className="w-full py-3 bg-cm-accent text-white rounded-xl font-bold text-sm hover:bg-cm-accent-l transition-colors disabled:opacity-60 mt-1"
            >
              {isPending ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Demo credentials */}
            <div className="border border-cm-border rounded-xl p-3 text-xs text-cm-muted">
              <p className="font-semibold text-cm-text mb-1">Demo Credentials:</p>
              <p>Admin: <span className="font-mono text-cm-accent">admin@chessmate.in / admin123</span></p>
              <p>Player: <span className="font-mono text-cm-accent">arjun@chessmate.in / player123</span></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { TournamentStatus } from '@/types';

// ---- Button ----
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const variants = {
    primary: 'bg-cm-accent text-white hover:bg-cm-accent-l',
    ghost:   'bg-transparent border border-cm-border text-cm-text hover:border-cm-accent hover:text-cm-accent',
    outline: 'bg-transparent border border-cm-accent text-cm-accent hover:bg-cm-accent/10',
    danger:  'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ---- StatusBadge ----
const statusMap: Record<TournamentStatus, { label: string; cls: string }> = {
  UPCOMING:  { label: 'Upcoming',           cls: 'bg-slate-700/50 text-slate-300' },
  OPEN:      { label: 'Registration Open',  cls: 'bg-green-900/40 text-green-400' },
  ONGOING:   { label: 'Ongoing',            cls: 'bg-orange-900/40 text-orange-400' },
  COMPLETED: { label: 'Completed',          cls: 'bg-slate-700/30 text-cm-muted' },
};
export function StatusBadge({ status }: { status: TournamentStatus }) {
  const { label, cls } = statusMap[status] || statusMap.UPCOMING;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

// ---- FormatBadge ----
export function FormatBadge({ format, fideRated }: { format: string; fideRated: boolean }) {
  const fmt = format.replace('_', ' ');
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 text-cm-muted text-xs">
      {fmt}{fideRated && <span className="text-cm-accent font-semibold">· FIDE</span>}
    </span>
  );
}

// ---- Card ----
export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`bg-cm-card rounded-2xl border border-cm-border ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ---- SectionTitle ----
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block text-xs font-bold text-cm-accent uppercase tracking-widest mb-3">
      {children}
    </span>
  );
}

// ---- Spinner ----
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-cm-border border-t-cm-accent ${className}`} />
  );
}

// ---- Input ----
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors placeholder:text-cm-muted font-sans ${className}`}
      {...props}
    />
  );
}

// ---- Select ----
export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      className={`w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ---- RatingDelta ----
export function RatingDelta({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-cm-muted font-mono text-sm">±0</span>;
  return (
    <span className={`font-mono text-sm font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
      {delta > 0 ? '+' : ''}{delta}
    </span>
  );
}

// ---- Empty State ----
export function EmptyState({ icon = '♟', title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-cm-text font-medium text-lg">{title}</p>
      {subtitle && <p className="text-cm-muted text-sm mt-2">{subtitle}</p>}
    </div>
  );
}

// ---- Page Header ----
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-cm-text mb-2">{title}</h1>
      {subtitle && <p className="text-cm-muted text-sm md:text-base">{subtitle}</p>}
    </div>
  );
}

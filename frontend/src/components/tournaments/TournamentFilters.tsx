import { X } from 'lucide-react';
import { Select } from '@/components/ui';

export interface Filters {
  q: string;
  state: string;
  format: string;
  status: string;
  fideRated: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const STATES = ['Tamil Nadu','Maharashtra','Karnataka','Delhi','Kerala','Telangana','West Bengal','Gujarat','Punjab','Rajasthan'];
const FORMATS = ['SWISS','ROUND_ROBIN','KNOCKOUT','BLITZ','RAPID','CLASSICAL'];
const STATUSES = [
  { value: 'OPEN',      label: 'Registration Open' },
  { value: 'UPCOMING',  label: 'Upcoming' },
  { value: 'ONGOING',   label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function TournamentFilters({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="sticky top-[62px] z-40 glass border-b border-cm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-cm-muted uppercase tracking-widest mr-1 hidden sm:block">Filter:</span>

        <select
          value={filters.state}
          onChange={e => set('state', e.target.value)}
          className="bg-cm-card border border-cm-border text-cm-text text-xs rounded-lg px-3 py-2 outline-none focus:border-cm-accent transition-colors cursor-pointer font-sans"
        >
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.format}
          onChange={e => set('format', e.target.value)}
          className="bg-cm-card border border-cm-border text-cm-text text-xs rounded-lg px-3 py-2 outline-none focus:border-cm-accent transition-colors cursor-pointer font-sans"
        >
          <option value="">All Formats</option>
          {FORMATS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
        </select>

        <select
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          className="bg-cm-card border border-cm-border text-cm-text text-xs rounded-lg px-3 py-2 outline-none focus:border-cm-accent transition-colors cursor-pointer font-sans"
        >
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select
          value={filters.fideRated}
          onChange={e => set('fideRated', e.target.value)}
          className="bg-cm-card border border-cm-border text-cm-text text-xs rounded-lg px-3 py-2 outline-none focus:border-cm-accent transition-colors cursor-pointer font-sans"
        >
          <option value="">FIDE & Unrated</option>
          <option value="true">FIDE Rated Only</option>
          <option value="false">Unrated Only</option>
        </select>

        {hasActive && (
          <button
            onClick={() => onChange({ q: '', state: '', format: '', status: '', fideRated: '' })}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

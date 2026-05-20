import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Trophy } from 'lucide-react';
import { Tournament } from '@/types';
import { StatusBadge, FormatBadge } from '@/components/ui';

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/tournaments/${tournament.slug}`)}
      className="bg-cm-card border border-cm-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-cm-accent group"
      style={{ boxShadow: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 10px 32px rgba(184,134,11,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Poster */}
      <div className="h-36 bg-gradient-to-br from-[#0d0d1e] via-[#1a1040] to-[#0d1630] flex items-center justify-center relative overflow-hidden">
        <div className="chess-diagonal-pattern absolute inset-0 opacity-60" />
        <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">
          {tournament.emoji}
        </span>
        {tournament.fideRated && (
          <span className="absolute top-3 right-3 bg-cm-accent/20 border border-cm-accent/40 text-cm-accent-l text-[10px] font-bold px-2 py-0.5 rounded z-10 tracking-wide">
            FIDE RATED
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-serif text-base font-bold text-cm-text leading-snug mb-3 line-clamp-2 group-hover:text-cm-accent transition-colors">
          {tournament.name}
        </h3>

        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-cm-muted">
            <MapPin size={11} className="text-cm-accent flex-shrink-0" />
            {tournament.city}, {tournament.state}
          </div>
          <div className="flex items-center gap-2 text-xs text-cm-muted">
            <Calendar size={11} className="text-cm-accent flex-shrink-0" />
            {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' – '}
            {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
          <div className="flex items-center gap-2 text-xs text-cm-muted">
            <Clock size={11} className="text-cm-accent flex-shrink-0" />
            {tournament.timeControl} · {tournament.rounds} rounds
          </div>
          <div className="flex items-center gap-2 text-xs text-cm-muted">
            <Trophy size={11} className="text-cm-accent flex-shrink-0" />
            Prize: <span className="text-cm-text font-medium">{tournament.prizePool}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-cm-border">
          <StatusBadge status={tournament.status} />
          <FormatBadge format={tournament.format} fideRated={tournament.fideRated} />
        </div>
      </div>
    </div>
  );
}

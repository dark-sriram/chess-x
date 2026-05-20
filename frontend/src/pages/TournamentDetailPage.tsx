import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Award, Share2, ExternalLink, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { Tournament } from '@/types';
import { StatusBadge, FormatBadge, Spinner, Button, SectionLabel } from '@/components/ui';

export default function TournamentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: tournament, isLoading, isError } = useQuery<Tournament>({
    queryKey: ['tournament', slug],
    queryFn: async () => {
      const res = await api.get(`/tournaments/${slug}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (isError || !tournament) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-cm-muted text-lg">Tournament not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-cm-accent hover:underline text-sm">
          ← Back to Tournaments
        </button>
      </div>
    );
  }

  const detail = tournament.detail;
  const prizes = (detail?.prizes as Array<{ position: string; amount: string }>) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-cm-accent hover:opacity-75 transition-opacity text-sm mb-6"
      >
        <ArrowLeft size={16} /> Back to Tournaments
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* MAIN */}
        <div>
          {/* Poster */}
          <div className="h-56 rounded-2xl bg-gradient-to-br from-[#0d0d1e] via-[#1a1040] to-[#0d1630] flex items-center justify-center relative overflow-hidden mb-6 border border-cm-border">
            <div className="chess-diagonal-pattern absolute inset-0" />
            <span className="text-8xl relative z-10">{tournament.emoji}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2 leading-tight">
            {tournament.name}
          </h1>
          <p className="text-cm-muted text-sm mb-6 flex items-center gap-2">
            <MapPin size={13} className="text-cm-accent" />
            {tournament.city}, {tournament.state}
            <span className="text-cm-border">·</span>
            <Calendar size={13} className="text-cm-accent" />
            {new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' — '}
            {new Date(tournament.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
          </p>

          {/* About */}
          <div className="mb-8">
            <SectionLabel>About</SectionLabel>
            <p className="text-cm-muted text-sm leading-relaxed">{tournament.about}</p>
          </div>

          {/* Details table */}
          <div className="mb-8">
            <SectionLabel>Tournament Details</SectionLabel>
            <div className="bg-cm-card rounded-xl border border-cm-border overflow-hidden">
              {[
                ['Format', tournament.format.replace('_', ' ')],
                ['Time Control', tournament.timeControl],
                ['Rounds', String(tournament.rounds)],
                ['Category', tournament.category],
                ['FIDE Rated', tournament.fideRated ? 'Yes ✓' : 'No'],
                ['Entry Fee', tournament.entryFee],
                ...(detail ? [
                  ['Chief Arbiter', detail.chiefArbiter],
                  ['Organizer', detail.organizer],
                  ...(detail.organizingCommittee ? [['Committee', detail.organizingCommittee]] : []),
                ] : []),
              ].map(([label, value], i) => (
                <div key={label} className={`flex text-sm ${i > 0 ? 'border-t border-cm-border/50' : ''}`}>
                  <div className="w-40 px-4 py-3 text-cm-muted flex-shrink-0">{label}</div>
                  <div className="px-4 py-3 text-cm-text font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prize Fund */}
          {prizes.length > 0 && (
            <div className="mb-8">
              <SectionLabel>Prize Fund — Total: {tournament.prizePool}</SectionLabel>
              <div className="bg-cm-card rounded-xl border border-cm-border overflow-hidden">
                <div className="grid grid-cols-2 bg-cm-accent/10 px-4 py-2 text-xs font-bold text-cm-accent uppercase tracking-widest">
                  <span>Prize</span><span>Amount</span>
                </div>
                {prizes.map((p, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 px-4 py-3 text-sm border-t border-cm-border/40 ${i === 0 ? 'text-yellow-400 font-bold' : 'text-cm-text'}`}
                  >
                    <span className="flex items-center gap-2">
                      {i === 0 && <Trophy size={13} />}{p.position}
                    </span>
                    <span>{p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue */}
          {detail?.venue && (
            <div className="mb-8">
              <SectionLabel>Venue</SectionLabel>
              <p className="text-cm-muted text-sm mb-3 flex items-start gap-2">
                <MapPin size={14} className="text-cm-accent mt-0.5 flex-shrink-0" />
                {detail.venue}
              </p>
              <div className="h-40 rounded-xl bg-cm-card border border-cm-border flex items-center justify-center text-cm-muted text-sm gap-2">
                <MapPin size={16} /> Map view — {detail.venue}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:sticky lg:top-20 flex flex-col gap-4">
          {/* Status card */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
            <div className="mb-4">
              <StatusBadge status={tournament.status} />
            </div>

            <div className="flex flex-col gap-3 mb-5 text-sm">
              {[
                { label: 'Format', value: tournament.format.replace('_', ' ') },
                { label: 'Time Control', value: tournament.timeControl },
                { label: 'Rounds', value: String(tournament.rounds) },
                { label: 'Entry Fee', value: tournament.entryFee, accent: true },
                { label: 'Prize Pool', value: tournament.prizePool, accent: true },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-cm-muted">{label}</span>
                  <span className={`font-medium ${accent ? 'text-cm-accent' : 'text-cm-text'}`}>{value}</span>
                </div>
              ))}
            </div>

            {tournament.status !== 'COMPLETED' && detail?.registrationLink && (
              <a
                href={detail.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-cm-accent text-white rounded-xl font-semibold text-sm hover:bg-cm-accent-l transition-colors mb-2"
              >
                Register Now <ExternalLink size={14} />
              </a>
            )}
            {tournament.status === 'COMPLETED' && detail?.resultsLink && (
              <a
                href={detail.resultsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-cm-card border border-cm-border text-cm-text rounded-xl font-semibold text-sm hover:border-cm-accent transition-colors mb-2"
              >
                View Results <ExternalLink size={14} />
              </a>
            )}
            {tournament.status !== 'COMPLETED' && !detail?.registrationLink && (
              <button className="w-full py-3 bg-cm-border text-cm-muted rounded-xl font-semibold text-sm cursor-not-allowed mb-2">
                Registration Coming Soon
              </button>
            )}
            <button
              onClick={() => navigator.share?.({ title: tournament.name, url: window.location.href })}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-cm-border text-cm-text rounded-xl text-sm hover:border-cm-accent hover:text-cm-accent transition-all"
            >
              <Share2 size={14} /> Share Tournament
            </button>
          </div>

          {/* Organizer card */}
          {detail && (
            <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
              <p className="text-xs text-cm-muted font-bold uppercase tracking-widest mb-2">Organizer</p>
              <p className="text-sm font-semibold text-cm-text mb-1">{detail.organizer}</p>
              <p className="text-xs text-cm-muted">Chief Arbiter: {detail.chiefArbiter}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

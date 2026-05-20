import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { TournamentsResponse } from '@/types';
import TournamentCard from '@/components/tournaments/TournamentCard';
import TournamentFilters, { Filters } from '@/components/tournaments/TournamentFilters';
import { Spinner, EmptyState } from '@/components/ui';

const LIMIT = 9;

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<Filters>({ q: '', state: '', format: '', status: '', fideRated: '' });

  const { data, isLoading, isError } = useQuery<TournamentsResponse>({
    queryKey: ['tournaments', filters, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (filters.q)        params.q = filters.q;
      if (filters.state)    params.state = filters.state;
      if (filters.format)   params.format = filters.format;
      if (filters.status)   params.status = filters.status;
      if (filters.fideRated) params.fideRated = filters.fideRated;
      const res = await api.get('/tournaments', { params });
      return res.data;
    },
    placeholderData: prev => prev,
  });

  const handleSearch = useCallback(() => {
    setFilters(f => ({ ...f, q: searchInput }));
    setPage(1);
  }, [searchInput]);

  const handleFilters = useCallback((f: Filters) => {
    setFilters(f);
    setPage(1);
  }, []);

  const tournaments = data?.data || [];
  const meta = data?.meta;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1e1540] via-cm-bg to-cm-bg py-20 px-4 text-center">
        <div className="chess-bg-pattern absolute inset-0 pointer-events-none" />
        {/* Glowing orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cm-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 mb-5 rounded-full border border-cm-accent/30 bg-cm-accent/10 text-cm-accent-l text-xs font-bold tracking-widest uppercase">
            🇮🇳 India's #1 Chess Platform
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-black leading-tight mb-4">
            Your Chess{' '}
            <span className="text-cm-accent">Journey</span>
            <br />Starts Here
          </h1>
          <p className="text-cm-muted text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Discover tournaments across India, track your FIDE rating, and analyze games with Stockfish — all in one place.
          </p>

          {/* Search */}
          <div className="flex max-w-xl mx-auto rounded-xl overflow-hidden border border-cm-border bg-cm-card focus-within:border-cm-accent transition-colors shadow-lg">
            <div className="flex items-center pl-4 text-cm-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search tournament name or city..."
              className="flex-1 bg-transparent px-3 py-4 text-sm text-cm-text placeholder:text-cm-muted outline-none font-sans"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-4 bg-cm-accent text-white text-sm font-semibold hover:bg-cm-accent-l transition-colors"
            >
              Search
            </button>
          </div>

          {/* Hero stats */}
          <div className="flex items-center justify-center gap-8 mt-10">
            {[['500+', 'Tournaments'], ['20K+', 'Players'], ['28', 'States']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="font-serif text-2xl font-bold text-cm-accent">{val}</div>
                <div className="text-xs text-cm-muted uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <TournamentFilters filters={filters} onChange={handleFilters} />

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-cm-muted">
            {isLoading ? 'Loading...' : meta ? `${meta.total} tournament${meta.total !== 1 ? 's' : ''} found` : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="w-8 h-8" />
          </div>
        ) : isError ? (
          <EmptyState icon="⚠️" title="Failed to load tournaments" subtitle="Please check your connection and try again." />
        ) : tournaments.length === 0 ? (
          <EmptyState icon="♟" title="No tournaments found" subtitle="Try adjusting your search or filters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {tournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-cm-border text-cm-muted hover:border-cm-accent hover:text-cm-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all border ${
                  p === page
                    ? 'bg-cm-accent border-cm-accent text-white'
                    : 'border-cm-border text-cm-muted hover:border-cm-accent hover:text-cm-accent'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-cm-border text-cm-muted hover:border-cm-accent hover:text-cm-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

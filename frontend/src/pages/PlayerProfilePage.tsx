import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api } from '@/lib/api';
import { PlayerProfile } from '@/types';
import { Spinner, RatingDelta, SectionLabel, EmptyState } from '@/components/ui';

const DEMO_PROFILE: PlayerProfile = {
  id: '1', username: 'arjunkumar',
  currentRating: 1842, peakRating: 1901, totalTournaments: 24, winRate: 68,
  bio: 'FIDE rated player from Tamil Nadu. Love classical chess and positional play.',
  user: { name: 'Arjun Kumar', email: 'arjun@chessmate.in', fideId: '5033506' },
  ratingHistory: [
    { id:'1', rating:1755, date:'2024-01-15', tournamentName:'Tamil Nadu Blitz 2024', delta:23 },
    { id:'2', rating:1778, date:'2024-03-10', tournamentName:'Coimbatore District Open 2024', delta:23 },
    { id:'3', rating:1801, date:'2024-05-20', tournamentName:'South India Open 2024', delta:23 },
    { id:'4', rating:1788, date:'2024-07-08', tournamentName:'Hyderabad Open 2024', delta:-13 },
    { id:'5', rating:1812, date:'2024-09-14', tournamentName:'Chennai Open Rapid 2024', delta:24 },
    { id:'6', rating:1829, date:'2024-11-22', tournamentName:'Tamil Nadu State 2024', delta:17 },
    { id:'7', rating:1835, date:'2025-01-18', tournamentName:'Coimbatore Classic 2025', delta:6 },
    { id:'8', rating:1842, date:'2025-03-08', tournamentName:'All India Open 2025', delta:7 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cm-card border border-cm-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-cm-muted mb-1">{label}</p>
      <p className="font-serif text-xl font-bold text-cm-accent">{payload[0].value}</p>
      <p className="text-xs text-cm-muted">Rating</p>
    </div>
  );
};

export default function PlayerProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: profile, isLoading } = useQuery<PlayerProfile>({
    queryKey: ['player', username],
    queryFn: async () => {
      try {
        const res = await api.get(`/players/${username}`);
        return res.data;
      } catch {
        // Return demo profile if backend not running
        return DEMO_PROFILE;
      }
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner className="w-8 h-8" /></div>;
  }

  if (!profile) return <EmptyState icon="👤" title="Player not found" />;

  const chartData = profile.ratingHistory.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    rating: e.rating,
    name: e.tournamentName,
  }));

  const stats = [
    { label: 'Current ELO', value: profile.currentRating, cls: 'text-cm-accent' },
    { label: 'Peak Rating', value: profile.peakRating, cls: 'text-cm-text' },
    { label: 'Tournaments', value: profile.totalTournaments, cls: 'text-cm-text' },
    { label: 'Win Rate', value: `${profile.winRate}%`, cls: 'text-green-400' },
    { label: 'Rating Gain (2025)', value: `+${profile.ratingHistory.filter(e => e.date.startsWith('2025')).reduce((a, b) => a + b.delta, 0)}`, cls: 'text-green-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Profile hero */}
      <div className="bg-cm-card rounded-2xl border border-cm-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cm-accent to-cm-accent-d flex items-center justify-center font-serif text-2xl font-bold text-white flex-shrink-0 border-2 border-cm-accent/40">
          {profile.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-cm-text mb-1">{profile.user.name}</h1>
          <p className="text-cm-muted text-sm mb-1">
            FIDE ID: {profile.user.fideId || 'Not registered'} · Tamil Nadu, India
          </p>
          <p className="text-cm-accent text-xs font-mono">chessmate.in/player/{profile.username}</p>
          {profile.bio && <p className="text-cm-muted text-sm mt-2 italic">"{profile.bio}"</p>}
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-cm-border text-sm text-cm-text hover:border-cm-accent hover:text-cm-accent transition-all">
            Edit Profile
          </button>
          <button className="px-4 py-2 rounded-lg bg-cm-accent text-white text-sm hover:bg-cm-accent-l transition-all">
            Share
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map(({ label, value, cls }) => (
          <div key={label} className="bg-cm-card rounded-xl border border-cm-border p-4 text-center">
            <div className={`font-serif text-2xl font-bold mb-1 ${cls}`}>{value}</div>
            <div className="text-xs text-cm-muted uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Grid: chart + history */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
        {/* ELO Chart */}
        <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold">ELO History</h2>
            <div className="flex gap-1">
              {['1Y', '2Y', 'All'].map(r => (
                <button key={r} className="px-2.5 py-1 text-xs rounded-lg border border-cm-border text-cm-muted hover:border-cm-accent hover:text-cm-accent transition-all">
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,74,106,0.3)" />
              <XAxis dataKey="date" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 30', 'dataMax + 30']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={profile.peakRating} stroke="rgba(184,134,11,0.3)" strokeDasharray="4 4" label={{ value: 'Peak', fill: '#B8860B', fontSize: 10 }} />
              <Line
                type="monotone" dataKey="rating" stroke="#B8860B" strokeWidth={2.5}
                dot={{ fill: '#B8860B', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#D4A017' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tournament History */}
        <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
          <h2 className="font-serif text-lg font-semibold mb-4">Tournament History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-cm-muted uppercase tracking-widest border-b border-cm-border text-left">
                  <th className="pb-2 font-semibold">Tournament</th>
                  <th className="pb-2 font-semibold">Before</th>
                  <th className="pb-2 font-semibold">After</th>
                  <th className="pb-2 font-semibold text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {[...profile.ratingHistory].reverse().map((entry) => (
                  <tr key={entry.id} className="border-b border-cm-border/30">
                    <td className="py-2.5 pr-2">
                      <div className="text-cm-text font-medium leading-tight truncate max-w-[150px]">
                        {entry.tournamentName || 'Unknown'}
                      </div>
                      <div className="text-cm-muted/60 mt-0.5">
                        {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-cm-muted">{entry.rating - entry.delta}</td>
                    <td className="py-2.5 font-mono text-cm-text font-medium">{entry.rating}</td>
                    <td className="py-2.5 text-right"><RatingDelta delta={entry.delta} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

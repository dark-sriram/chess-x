import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, BarChart2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Tournament, TournamentStatus, TournamentFormat } from '@/types';
import { Spinner, StatusBadge, Button, SectionLabel } from '@/components/ui';

const FORMATS: TournamentFormat[] = ['SWISS','ROUND_ROBIN','KNOCKOUT','BLITZ','RAPID','CLASSICAL'];
const STATUSES: TournamentStatus[] = ['UPCOMING','OPEN','ONGOING','COMPLETED'];
const STATES = ['Tamil Nadu','Maharashtra','Karnataka','Delhi','Kerala','Telangana','West Bengal','Gujarat','Punjab'];

const emptyForm = {
  name:'', city:'', state:'Tamil Nadu', startDate:'', endDate:'',
  format:'SWISS' as TournamentFormat, rounds:9, timeControl:'90+30',
  category:'Open', fideRated:false, entryFee:'', prizePool:'', status:'UPCOMING' as TournamentStatus,
  emoji:'♟', about:'',
  detail: { venue:'', chiefArbiter:'', organizer:'', organizingCommittee:'',
    registrationLink:'', prizes:[{position:'1st Prize', amount:''}] },
};

export default function AdminPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState<'tournaments'|'analytics'>('tournaments');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: () => api.get('/tournaments', { params: { limit: 50 } }).then(r => r.data),
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
    enabled: tab === 'analytics',
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => editId ? api.put(`/tournaments/${editId}`, d) : api.post('/tournaments', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tournaments'] }); qc.invalidateQueries({ queryKey: ['tournaments'] }); setShowForm(false); setEditId(null); setForm(emptyForm); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tournaments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tournaments'] }),
  });

  const handleEdit = (t: Tournament) => {
    setEditId(t.id);
    setForm({
      ...emptyForm, ...t,
      startDate: t.startDate.slice(0, 10),
      endDate: t.endDate.slice(0, 10),
      detail: t.detail ? { ...emptyForm.detail, ...t.detail, prizes: (t.detail.prizes as any) || emptyForm.detail.prizes } : emptyForm.detail,
    });
    setShowForm(true);
  };

  const sf = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const sd = (key: string, val: any) => setForm(f => ({ ...f, detail: { ...f.detail, [key]: val } }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Admin Panel</h1>
          <p className="text-cm-muted text-sm mt-1">Manage tournaments and view analytics</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-cm-accent text-white rounded-xl font-semibold text-sm hover:bg-cm-accent-l transition-colors"
        >
          <Plus size={16} /> New Tournament
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['tournaments', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-cm-accent text-white' : 'border border-cm-border text-cm-muted hover:text-cm-text'}`}>
            {t === 'analytics' ? '📊 Analytics' : '🏆 Tournaments'}
          </button>
        ))}
      </div>

      {tab === 'analytics' && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tournaments', value: analytics.totalTournaments },
            { label: 'Page Views', value: analytics.totalViews },
            { label: 'Register Clicks', value: analytics.totalClicks },
            { label: 'Recent Additions', value: analytics.recentTournaments?.length || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-cm-card border border-cm-border rounded-xl p-5 text-center">
              <div className="font-serif text-3xl font-bold text-cm-accent">{value}</div>
              <div className="text-xs text-cm-muted mt-1 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tournaments' && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner className="w-7 h-7" /></div>
          ) : (
            <div className="bg-cm-card rounded-2xl border border-cm-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cm-border text-xs text-cm-muted uppercase tracking-widest bg-black/20">
                    <th className="text-left px-5 py-3">Tournament</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">City</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Format</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data || []).map((t: Tournament) => (
                    <tr key={t.id} className="border-b border-cm-border/40 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span>{t.emoji}</span>
                          <span className="font-medium text-cm-text truncate max-w-[200px]">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-cm-muted hidden md:table-cell">{t.city}</td>
                      <td className="px-4 py-3.5 text-cm-muted hidden lg:table-cell">{t.format}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-cm-muted hover:text-cm-accent hover:bg-cm-accent/10 transition-all">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this tournament?')) deleteMutation.mutate(t.id); }}
                            className="p-1.5 rounded-lg text-cm-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-cm-card border border-cm-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-cm-card border-b border-cm-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif text-xl font-bold">{editId ? 'Edit Tournament' : 'New Tournament'}</h2>
              <button onClick={() => setShowForm(false)} className="text-cm-muted hover:text-cm-text text-xl">✕</button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label:'Tournament Name', key:'name', type:'text', span:2 },
                  { label:'City', key:'city', type:'text' },
                  { label:'Entry Fee', key:'entryFee', type:'text' },
                  { label:'Prize Pool', key:'prizePool', type:'text' },
                  { label:'Time Control', key:'timeControl', type:'text' },
                  { label:'Rounds', key:'rounds', type:'number' },
                  { label:'Start Date', key:'startDate', type:'date' },
                  { label:'End Date', key:'endDate', type:'date' },
                  { label:'Category', key:'category', type:'text' },
                  { label:'Emoji', key:'emoji', type:'text' },
                ].map(({ label, key, type, span }) => (
                  <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => sf(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans" />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">State</label>
                  <select value={form.state} onChange={e => sf('state', e.target.value)} className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer">
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Format</label>
                  <select value={form.format} onChange={e => sf('format', e.target.value)} className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer">
                    {FORMATS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => sf('status', e.target.value)} className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="fideRated" checked={form.fideRated} onChange={e => sf('fideRated', e.target.checked)} className="w-4 h-4 accent-[#B8860B]" />
                  <label htmlFor="fideRated" className="text-sm text-cm-text cursor-pointer">FIDE Rated Tournament</label>
                </div>
              </div>

              <div>
                <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">About</label>
                <textarea value={form.about} onChange={e => sf('about', e.target.value)} rows={3}
                  className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans resize-none" />
              </div>

              <div className="border-t border-cm-border pt-4">
                <SectionLabel>Venue & Organizer</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label:'Venue', key:'venue' }, { label:'Chief Arbiter', key:'chiefArbiter' },
                    { label:'Organizer', key:'organizer' }, { label:'Registration Link', key:'registrationLink' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">{label}</label>
                      <input value={(form.detail as any)[key] || ''} onChange={e => sd(key, e.target.value)}
                        className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-cm-border text-cm-text rounded-xl text-sm font-semibold hover:border-cm-border-l transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => createMutation.mutate(form)}
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 bg-cm-accent text-white rounded-xl text-sm font-bold hover:bg-cm-accent-l transition-colors disabled:opacity-60"
                >
                  {createMutation.isPending ? 'Saving...' : editId ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Trash2, Plus, Info } from 'lucide-react';
import { v4 as uuid } from 'crypto';
import { CalcOpponent, CalcResult } from '@/types';
import { calculateRating, getKFactor } from '@/lib/fide';
import { PageHeader, SectionLabel, RatingDelta } from '@/components/ui';

function uid() { return Math.random().toString(36).slice(2); }

export default function CalculatorPage() {
  const [myRating, setMyRating] = useState(1650);
  const [kOverride, setKOverride] = useState<number | undefined>(undefined);
  const [opponents, setOpponents] = useState<CalcOpponent[]>([
    { id: uid(), rating: 1700, result: 1 },
    { id: uid(), rating: 1800, result: 0.5 },
    { id: uid(), rating: 1600, result: 0 },
  ]);
  const [result, setResult] = useState<CalcResult | null>(null);

  const kFactor = getKFactor(myRating, kOverride);

  const addOpponent = () =>
    setOpponents(o => [...o, { id: uid(), rating: 1500, result: 0.5 }]);

  const removeOpponent = (id: string) =>
    setOpponents(o => o.filter(x => x.id !== id));

  const updateOpponent = (id: string, key: keyof CalcOpponent, value: number) =>
    setOpponents(o => o.map(x => x.id === id ? { ...x, [key]: value } : x));

  const calculate = useCallback(() => {
    if (opponents.length === 0) return;
    setResult(calculateRating(myRating, opponents, kOverride));
  }, [myRating, opponents, kOverride]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <PageHeader
        title="FIDE Rating Calculator"
        subtitle="Calculate your expected rating change using the official FIDE Elo formula"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* MAIN */}
        <div className="flex flex-col gap-5">
          {/* Step 1 */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-6">
            <SectionLabel>Step 1 — Your Details</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-2">
                  Current Rating
                </label>
                <input
                  type="number"
                  value={myRating}
                  onChange={e => setMyRating(Number(e.target.value))}
                  className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                  placeholder="e.g. 1650"
                  min={100} max={3000}
                />
              </div>
              <div>
                <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-2">
                  K-Factor{' '}
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-cm-accent/20 text-cm-accent text-[11px] font-bold">
                    K={kFactor}
                  </span>
                </label>
                <select
                  value={kOverride ?? 'auto'}
                  onChange={e => setKOverride(e.target.value === 'auto' ? undefined : Number(e.target.value))}
                  className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer"
                >
                  <option value="auto">Auto-select (Recommended)</option>
                  <option value={40}>K=40 — New Player (&lt;30 rated games)</option>
                  <option value={20}>K=20 — Standard</option>
                  <option value={10}>K=10 — Rating 2400+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2 — Opponents */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-6">
            <SectionLabel>Step 2 — Add Opponents</SectionLabel>

            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-xs text-cm-muted uppercase tracking-widest border-b border-cm-border">
                    <th className="text-left pb-3 w-8">#</th>
                    <th className="text-left pb-3">Opponent Rating</th>
                    <th className="text-left pb-3 px-2">Result</th>
                    <th className="text-left pb-3">Expected Score</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {opponents.map((opp, i) => {
                    const expected = 1 / (1 + Math.pow(10, (opp.rating - myRating) / 400));
                    return (
                      <tr key={opp.id} className="border-b border-cm-border/40">
                        <td className="py-2 text-cm-muted/60 text-xs pr-2">{i + 1}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            value={opp.rating}
                            onChange={e => updateOpponent(opp.id, 'rating', Number(e.target.value))}
                            className="w-24 bg-black/30 border border-cm-border text-cm-text rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans"
                            min={100} max={3000}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={opp.result}
                            onChange={e => updateOpponent(opp.id, 'result', Number(e.target.value) as 1 | 0.5 | 0)}
                            className="bg-black/30 border border-cm-border text-cm-text rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-cm-accent transition-colors font-sans cursor-pointer"
                          >
                            <option value={1}>Win (1)</option>
                            <option value={0.5}>Draw (½)</option>
                            <option value={0}>Loss (0)</option>
                          </select>
                        </td>
                        <td className="py-2 font-mono text-sm text-cm-muted">
                          {expected.toFixed(3)}
                        </td>
                        <td className="py-2 pl-2">
                          <button
                            onClick={() => removeOpponent(opp.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-cm-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={addOpponent}
              className="flex items-center gap-2 px-4 py-2 text-sm text-cm-accent border border-dashed border-cm-accent/40 rounded-lg hover:bg-cm-accent/10 hover:border-cm-accent transition-all"
            >
              <Plus size={14} /> Add Opponent
            </button>
          </div>

          {/* Calculate button */}
          <button
            onClick={calculate}
            disabled={opponents.length === 0}
            className="w-full py-4 bg-cm-accent text-white rounded-xl font-bold text-base hover:bg-cm-accent-l transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚡ Calculate Rating Change
          </button>

          {/* Results */}
          {result && (
            <div className="bg-cm-accent/8 border border-cm-accent/25 rounded-2xl p-6 animate-slide-up">
              <SectionLabel>Results</SectionLabel>

              {/* Big number */}
              <div className="text-center mb-8">
                <p className="text-xs text-cm-muted uppercase tracking-widest mb-2">New Rating</p>
                <p className="font-serif text-6xl font-black text-cm-text">{result.newRating}</p>
                <div className={`text-2xl font-bold mt-2 font-sans ${result.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.delta >= 0 ? '+' : ''}{result.delta} points
                </div>
                <p className="text-xs text-cm-muted mt-1">K-Factor used: {result.kFactor}</p>
              </div>

              {/* Breakdown table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-cm-muted uppercase tracking-widest border-b border-cm-accent/20">
                    <th className="text-left pb-2">Opp. Rating</th>
                    <th className="text-left pb-2">Result</th>
                    <th className="text-left pb-2">Expected</th>
                    <th className="text-right pb-2">Rating Change</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} className="border-b border-cm-border/30">
                      <td className="py-2.5 font-mono">{row.rating}</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-semibold ${row.result === 1 ? 'text-green-400' : row.result === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {row.result === 1 ? 'Win' : row.result === 0.5 ? 'Draw' : 'Loss'}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-cm-muted">{row.expected.toFixed(3)}</td>
                      <td className="py-2.5 text-right">
                        <RatingDelta delta={Math.round(row.delta)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-cm-accent/30 font-bold">
                    <td colSpan={3} className="pt-3 text-cm-text">Total (K={result.kFactor})</td>
                    <td className="pt-3 text-right">
                      <RatingDelta delta={result.delta} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          {/* K-Factor Guide */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
            <SectionLabel>K-Factor Guide</SectionLabel>
            <div className="flex flex-col gap-3 text-sm">
              {[
                { k: 'K=40', cls: 'bg-green-900/30 text-green-400', desc: 'New player or fewer than 30 FIDE rated games' },
                { k: 'K=20', cls: 'bg-cm-accent/20 text-cm-accent', desc: 'Standard for most active club players' },
                { k: 'K=10', cls: 'bg-red-900/30 text-red-400', desc: 'Players who have reached 2400 FIDE' },
              ].map(({ k, cls, desc }) => (
                <div key={k} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded font-mono font-bold text-xs ${cls}`}>{k}</span>
                  <span className="text-cm-muted text-xs leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formula */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
            <SectionLabel>FIDE Formula</SectionLabel>
            <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-center mb-3">
              <div className="text-cm-accent font-bold mb-2">Rn = Ro + K × (W − We)</div>
              <div className="text-xs text-cm-muted font-mono">We = 1 / (1 + 10^((Ro₂−Ro₁)/400))</div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-cm-muted">
              <div><strong className="text-cm-text">Rn</strong> — New rating</div>
              <div><strong className="text-cm-text">Ro</strong> — Old rating</div>
              <div><strong className="text-cm-text">K</strong> — K-factor</div>
              <div><strong className="text-cm-text">W</strong> — Actual score</div>
              <div><strong className="text-cm-text">We</strong> — Expected score</div>
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-cm-card rounded-2xl border border-cm-border p-5">
            <SectionLabel>Live Preview</SectionLabel>
            <div className="text-center">
              <div className="text-cm-muted text-xs mb-1">Current Rating</div>
              <div className="font-serif text-3xl font-bold text-cm-text">{myRating}</div>
              <div className="text-cm-muted text-xs mt-3 mb-1">K-Factor</div>
              <div className="font-mono text-cm-accent font-bold">K = {kFactor}</div>
              <div className="text-cm-muted text-xs mt-3 mb-1">Opponents Added</div>
              <div className="font-mono text-cm-text font-bold">{opponents.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

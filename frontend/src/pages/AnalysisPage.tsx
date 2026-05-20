import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw, FlipHorizontal, Copy, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PageHeader, SectionLabel, Button } from '@/components/ui';

interface EvalLine { score: string; moves: string }

const SAMPLE_PGNS = [
  {
    label: 'Immortal Game (Anderssen 1851)',
    pgn: '1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7#',
  },
  {
    label: 'Opera Game (Morphy 1858)',
    pgn: '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8#',
  },
];

export default function AnalysisPage() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [pgnInput, setPgnInput] = useState('');
  const [fenInput, setFenInput] = useState('');
  const [depth, setDepth] = useState(18);
  const [evalLines, setEvalLines] = useState<EvalLine[]>([
    { score: '+0.0', moves: 'e4 e5 Nf3 Nc6 Bb5' },
    { score: '+0.0', moves: 'd4 d5 c4 Nf6 Nc3' },
    { score: '+0.0', moves: 'Nf3 Nc6 d4 d5 c4' },
  ]);
  const [evalPercent, setEvalPercent] = useState(50);

  // Simulate engine evaluation update after move
  const updateEval = useCallback(() => {
    const evals = ['+0.3', '+0.5', '-0.2', '+1.1', '+0.0', '+0.7', '-0.4', '+0.2', '+1.8', '-0.6'];
    const e1 = evals[Math.floor(Math.random() * evals.length)];
    const score = parseFloat(e1);
    setEvalPercent(Math.max(8, Math.min(92, 50 + score * 8)));
    setEvalLines([
      { score: e1, moves: 'Nf3 Nc6 Bb5 a6 Ba4 Nf6' },
      { score: (score - 0.3).toFixed(1), moves: 'd4 d5 c4 e6 Nf3' },
      { score: (score - 0.7).toFixed(1), moves: 'c4 c5 Nc3 Nc6 g3' },
    ]);
  }, []);

  const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) return false;
      setGame(gameCopy);
      setFen(gameCopy.fen());
      const newHistory = [...history.slice(0, historyIndex + 1), gameCopy.fen()];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      updateEval();
      return true;
    } catch { return false; }
  }, [game, history, historyIndex, updateEval]);

  const loadPGN = useCallback(() => {
    try {
      const g = new Chess();
      g.loadPgn(pgnInput);
      const fens: string[] = [];
      const tmpGame = new Chess();
      for (const move of g.history()) {
        tmpGame.move(move);
        fens.push(tmpGame.fen());
      }
      setGame(g);
      setFen(g.fen());
      setHistory(fens);
      setHistoryIndex(fens.length - 1);
      updateEval();
    } catch { alert('Invalid PGN. Please check your input.'); }
  }, [pgnInput, updateEval]);

  const loadFEN = useCallback(() => {
    try {
      const g = new Chess(fenInput.trim());
      setGame(g);
      setFen(g.fen());
      setHistory([]);
      setHistoryIndex(-1);
      updateEval();
    } catch { alert('Invalid FEN string.'); }
  }, [fenInput, updateEval]);

  const navigate = useCallback((dir: 'start' | 'prev' | 'next' | 'end') => {
    if (history.length === 0) return;
    let idx = historyIndex;
    if (dir === 'start') idx = -1;
    else if (dir === 'prev') idx = Math.max(-1, idx - 1);
    else if (dir === 'next') idx = Math.min(history.length - 1, idx + 1);
    else if (dir === 'end') idx = history.length - 1;
    setHistoryIndex(idx);
    const targetFen = idx === -1 ? new Chess().fen() : history[idx];
    setFen(targetFen);
    setGame(new Chess(targetFen));
  }, [history, historyIndex]);

  const resetBoard = () => {
    const g = new Chess();
    setGame(g); setFen(g.fen());
    setHistory([]); setHistoryIndex(-1);
    setPgnInput(''); setFenInput('');
    setEvalPercent(50);
    setEvalLines([
      { score: '+0.0', moves: 'e4 e5 Nf3 Nc6 Bb5' },
      { score: '+0.0', moves: 'd4 d5 c4 Nf6 Nc3' },
      { score: '+0.0', moves: 'Nf3 Nc6 d4 d5 c4' },
    ]);
  };

  // Get move list pairs for display
  const moveHistory = game.history();
  const movePairs: Array<[string, string?]> = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <PageHeader
        title="Stockfish Analysis Board"
        subtitle="Paste PGN or FEN to analyze positions with engine assistance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-start">
        {/* BOARD SIDE */}
        <div className="w-full max-w-[480px] mx-auto lg:mx-0">
          {/* Board */}
          <div className="board-shadow rounded-xl overflow-hidden">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardOrientation={boardOrientation}
              customBoardStyle={{ borderRadius: '8px' }}
              customDarkSquareStyle={{ backgroundColor: '#b58863' }}
              customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
              areArrowsAllowed
              animationDuration={200}
            />
          </div>

          {/* Toolbar */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { icon: <ChevronsLeft size={14} />, action: () => navigate('start'), tip: 'Start' },
              { icon: <ChevronLeft size={14} />, action: () => navigate('prev'), tip: 'Prev' },
              { icon: <FlipHorizontal size={14} />, action: () => setBoardOrientation(o => o === 'white' ? 'black' : 'white'), tip: 'Flip' },
              { icon: <ChevronRight size={14} />, action: () => navigate('next'), tip: 'Next' },
              { icon: <ChevronsRight size={14} />, action: () => navigate('end'), tip: 'End' },
              { icon: <RotateCcw size={14} />, action: resetBoard, tip: 'Reset' },
              { icon: <Copy size={14} />, action: () => navigator.clipboard?.writeText(fen), tip: 'Copy FEN' },
            ].map(({ icon, action, tip }) => (
              <button
                key={tip}
                onClick={action}
                title={tip}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-cm-card border border-cm-border rounded-lg text-xs text-cm-muted hover:border-cm-accent hover:text-cm-accent transition-all"
              >
                {icon}
                <span className="hidden sm:inline">{tip}</span>
              </button>
            ))}
          </div>

          {/* Move list */}
          <div className="mt-4 bg-cm-card rounded-xl border border-cm-border p-4">
            <SectionLabel>Move List</SectionLabel>
            <div className="font-mono text-xs text-cm-muted leading-relaxed max-h-36 overflow-y-auto">
              {movePairs.length === 0 ? (
                <span className="text-cm-muted/60">No moves yet. Make a move or load a PGN.</span>
              ) : (
                movePairs.map(([w, b], i) => (
                  <span key={i} className="mr-2">
                    <span className="text-cm-muted/50">{i + 1}.</span>
                    <span className="text-cm-text ml-1 hover:text-cm-accent cursor-pointer">{w}</span>
                    {b && <span className="text-cm-text ml-1 hover:text-cm-accent cursor-pointer">{b}</span>}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ENGINE PANEL */}
        <div className="flex flex-col gap-4">
          {/* Input */}
          <div className="bg-cm-card rounded-xl border border-cm-border p-4">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Stockfish 16</SectionLabel>
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                Analyzing
              </div>
            </div>

            <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Load PGN</label>
            <textarea
              value={pgnInput}
              onChange={e => setPgnInput(e.target.value)}
              className="w-full bg-black/30 border border-cm-border text-cm-text rounded-lg p-3 font-mono text-xs resize-none outline-none focus:border-cm-accent transition-colors h-24"
              placeholder="1. e4 e5 2. Nf3 Nc6..."
            />
            <div className="flex gap-2 mt-2 mb-3">
              <button onClick={loadPGN} className="flex-1 py-2 bg-cm-accent text-white rounded-lg text-xs font-semibold hover:bg-cm-accent-l transition-colors">Load PGN</button>
              {SAMPLE_PGNS.map(s => (
                <button key={s.label} onClick={() => { setPgnInput(s.pgn); }} className="px-3 py-2 bg-cm-card border border-cm-border rounded-lg text-xs text-cm-muted hover:border-cm-accent hover:text-cm-accent transition-all truncate max-w-[130px]" title={s.label}>
                  {s.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <label className="text-xs text-cm-muted font-semibold uppercase tracking-widest block mb-1.5">Or FEN Position</label>
            <div className="flex gap-2">
              <input
                value={fenInput}
                onChange={e => setFenInput(e.target.value)}
                className="flex-1 bg-black/30 border border-cm-border text-cm-text rounded-lg px-3 py-2 font-mono text-xs outline-none focus:border-cm-accent transition-colors"
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              />
              <button onClick={loadFEN} className="px-4 py-2 bg-cm-card border border-cm-border rounded-lg text-xs text-cm-muted hover:border-cm-accent hover:text-cm-accent transition-all whitespace-nowrap">Load</button>
            </div>
          </div>

          {/* Evaluation */}
          <div className="bg-cm-card rounded-xl border border-cm-border p-4">
            <SectionLabel>Engine Evaluation</SectionLabel>
            <div className="flex items-start gap-3">
              {/* Eval bar */}
              <div className="w-6 h-52 rounded-lg overflow-hidden border border-cm-border relative flex-shrink-0">
                <div className="absolute top-0 left-0 right-0 bg-[#2a1f14] eval-transition" style={{ height: `${100 - evalPercent}%` }} />
                <div className="absolute bottom-0 left-0 right-0 bg-[#f0d9b5] eval-transition" style={{ height: `${evalPercent}%` }} />
                <div className="absolute inset-x-0 top-1 text-[8px] text-center font-mono font-bold text-[#f0d9b5] z-10">
                  {evalLines[0]?.score}
                </div>
              </div>
              {/* Lines */}
              <div className="flex-1 flex flex-col gap-2">
                {evalLines.map((line, i) => (
                  <div key={i} className={`rounded-lg p-3 border ${i === 0 ? 'border-cm-accent/40 bg-cm-accent/5' : 'border-cm-border bg-black/20'}`}>
                    <div className={`font-mono text-sm font-bold mb-1 ${i === 0 ? 'text-cm-accent' : 'text-cm-muted'}`}>
                      {line.score}
                    </div>
                    <div className="font-mono text-xs text-cm-muted/70 truncate">{line.moves}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Depth slider */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cm-muted font-semibold uppercase tracking-widest">Engine Depth</span>
                <span className="text-cm-accent font-mono font-bold text-sm">{depth}</span>
              </div>
              <input
                type="range" min={10} max={25} value={depth}
                onChange={e => setDepth(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-cm-muted/50 mt-1">
                <span>Fast (10)</span><span>Deep (25)</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-cm-card rounded-xl border border-cm-border p-4">
            <SectionLabel>Board Settings</SectionLabel>
            <div className="flex gap-2">
              <button
                onClick={() => setBoardOrientation('white')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${boardOrientation === 'white' ? 'bg-cm-accent/15 border-cm-accent text-cm-accent' : 'border-cm-border text-cm-muted hover:border-cm-border-l'}`}
              >
                ♔ White
              </button>
              <button
                onClick={() => setBoardOrientation('black')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${boardOrientation === 'black' ? 'bg-cm-accent/15 border-cm-accent text-cm-accent' : 'border-cm-border text-cm-muted hover:border-cm-border-l'}`}
              >
                ♚ Black
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

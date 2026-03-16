import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';

const ENERGY_COST = 100;
const EMOJIS = ['🐱', '🦁', '🐯', '🐈', '🐆', '😺', '🙀', '😻'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createBoard(): Card[] {
  const pairs = EMOJIS.flatMap((emoji, i) => [
    { id: i * 2, emoji, flipped: false, matched: false },
    { id: i * 2 + 1, emoji, flipped: false, matched: false },
  ]);
  // Shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

export function MemoryMatchPage() {
  const navigate = useNavigate();
  const { progress, spendEnergy } = useProgress();
  const { getStorageKey } = useProfile();
  const bestScoreKey = getStorageKey('chidon-memory-best');
  const energy = progress.energy || 0;
  const canPlay = energy >= ENERGY_COST;

  const [cards, setCards] = useState<Card[]>([]);
  const [playing, setPlaying] = useState(false);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [bestMoves, setBestMoves] = useState(() =>
    Number(localStorage.getItem(bestScoreKey) || '0')
  );

  const startGame = useCallback(() => {
    if (!canPlay) return;
    const spent = spendEnergy(ENERGY_COST);
    if (!spent) return;

    setCards(createBoard());
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setLocked(false);
    setPlaying(true);
  }, [canPlay, spendEnergy]);

  const handleFlip = (id: number) => {
    if (locked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setLocked(true);

      const [firstId, secondId] = newFlipped;
      const first = cards.find(c => c.id === firstId)!;
      const second = cards.find(c => c.id === secondId)!;

      if (first.emoji === second.emoji) {
        // Match!
        const newMatches = matches + 1;
        setMatches(newMatches);
        setCards(prev => prev.map(c =>
          c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
        ));
        setFlippedIds([]);
        setLocked(false);

        // Check win
        if (newMatches === EMOJIS.length) {
          const totalMoves = moves + 1;
          const prev = Number(localStorage.getItem(bestScoreKey) || '0');
          if (prev === 0 || totalMoves < prev) {
            localStorage.setItem(bestScoreKey, String(totalMoves));
            setBestMoves(totalMoves);
          }
        }
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setLocked(false);
        }, 800);
      }
    }
  };

  const won = matches === EMOJIS.length && playing;

  return (
    <div className="space-y-4 text-center" dir="ltr">
      <h2 className="text-2xl font-bold text-gray-800">🧠 Memory Match</h2>
      <p className="text-gray-500 text-sm">Find all matching pairs of cats!</p>

      <div className="inline-flex items-center gap-4 text-sm">
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
          ⚡ {energy} energy
        </span>
        {bestMoves > 0 && (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
            🏆 Best: {bestMoves} moves
          </span>
        )}
      </div>

      {!playing && !won && (
        <div className="py-8">
          <div className="text-6xl mb-4">🧠</div>
          <button
            onClick={startGame}
            disabled={!canPlay}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-none cursor-pointer ${
              canPlay
                ? 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {canPlay ? `Play (⚡${ENERGY_COST})` : `Need ⚡${ENERGY_COST} energy`}
          </button>
        </div>
      )}

      {playing && (
        <>
          <div className="text-sm text-gray-600 font-medium">
            Moves: {moves} | Matches: {matches}/{EMOJIS.length}
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                className={`
                  aspect-square rounded-xl text-3xl font-bold transition-all border-2 cursor-pointer
                  ${card.matched
                    ? 'bg-green-100 border-green-300 scale-95'
                    : card.flipped
                    ? 'bg-white border-blue-400'
                    : 'bg-israel-blue border-israel-blue hover:bg-israel-blue-dark'
                  }
                `}
                disabled={card.flipped || card.matched || locked}
              >
                {card.flipped || card.matched ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </>
      )}

      {won && (
        <div className="py-6 animate-pop-in">
          <div className="text-6xl mb-2">🎉</div>
          <p className="text-xl font-bold text-gray-800">You won!</p>
          <p className="text-gray-600">Completed in {moves} moves</p>
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={startGame}
              disabled={!canPlay}
              className={`px-6 py-2 rounded-xl font-bold transition-all border-none cursor-pointer ${
                canPlay
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {canPlay ? `Again (⚡${ENERGY_COST})` : 'No energy'}
            </button>
            <button
              onClick={() => navigate('/cats')}
              className="px-6 py-2 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all border-none cursor-pointer"
            >
              Shop
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/cats')}
        className="w-full bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-gray-200 cursor-pointer"
      >
        Back to Shop
      </button>
    </div>
  );
}

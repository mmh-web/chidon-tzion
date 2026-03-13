import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { startMusic, stopMusic } from '../utils/music';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { progress } = useProgress();
  const coins = progress.coins || 0;
  const ownedCats = progress.ownedCats || [];
  const musicUnlocked = progress.musicUnlocked || false;
  const activeTrack = progress.activeTrack || '';

  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('chidon-music-muted') === 'true';
  });

  // Auto-start music when unlocked and not muted
  useEffect(() => {
    if (musicUnlocked && activeTrack && !muted) {
      startMusic(activeTrack);
    }
    return () => {
      stopMusic();
    };
  }, [musicUnlocked, activeTrack, muted]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem('chidon-music-muted', String(newMuted));
    if (newMuted) {
      stopMusic();
    } else if (musicUnlocked && activeTrack) {
      startMusic(activeTrack);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-israel-blue text-white py-4 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline text-white">
            <span className="text-3xl">🇮🇱</span>
            <div>
              <h1 className="text-2xl font-bold m-0 leading-tight">חידון ציון</h1>
              <p className="text-xs opacity-80 m-0" dir="ltr">Chidon Tzion</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {musicUnlocked && (
              <button
                onClick={toggleMute}
                className="bg-white/20 hover:bg-white/30 text-white w-9 h-9 rounded-lg flex items-center justify-center transition-colors border-none cursor-pointer text-lg"
                title={muted ? 'Unmute music' : 'Mute music'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
            )}
            <Link
              to="/cats"
              className="bg-yellow-400/90 hover:bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors no-underline flex items-center gap-1"
            >
              ₪{coins} {ownedCats.length > 0 && <span>| 🐱 {ownedCats.length}</span>}
            </Link>
            {!isHome && (
              <Link
                to="/"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline"
              >
                🏠 Home
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}

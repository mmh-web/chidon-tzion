import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';

const CANVAS_W = 360;
const CANVAS_H = 600;
const PLAYER_W = 30;
const PLAYER_H = 30;
const PLATFORM_W = 70;
const PLATFORM_H = 12;
const GRAVITY = 0.4;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;
const ENERGY_COST = 200;

interface Platform {
  x: number;
  y: number;
  w: number;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function generatePlatforms(count: number, startY: number): Platform[] {
  const platforms: Platform[] = [];
  for (let i = 0; i < count; i++) {
    platforms.push({
      x: Math.random() * (CANVAS_W - PLATFORM_W),
      y: startY - i * 80 - Math.random() * 40,
      w: PLATFORM_W - Math.random() * 20,
    });
  }
  return platforms;
}

export function SkyClimberPage() {
  const navigate = useNavigate();
  const { progress, spendEnergy } = useProgress();
  const { getStorageKey } = useProfile();
  const energy = progress.energy || 0;
  const canPlay = energy >= ENERGY_COST;
  const highScoreKey = getStorageKey('chidon-skyclimber-high');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem(highScoreKey) || '0');
  });
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    player: { x: CANVAS_W / 2 - PLAYER_W / 2, y: CANVAS_H - 100, vx: 0, vy: 0 } as Player,
    platforms: [] as Platform[],
    score: 0,
    keys: { left: false, right: false },
    cameraY: 0,
    running: false,
  });

  const startGame = useCallback(() => {
    if (!canPlay) return;
    const spent = spendEnergy(ENERGY_COST);
    if (!spent) return;

    const gs = gameState.current;
    gs.player = { x: CANVAS_W / 2 - PLAYER_W / 2, y: CANVAS_H - 100, vx: 0, vy: JUMP_FORCE };
    gs.platforms = [
      { x: CANVAS_W / 2 - PLATFORM_W / 2, y: CANVAS_H - 50, w: PLATFORM_W },
      ...generatePlatforms(20, CANVAS_H - 130),
    ];
    gs.score = 0;
    gs.cameraY = 0;
    gs.running = true;

    setPlaying(true);
    setGameOver(false);
    setScore(0);
  }, [canPlay, spendEnergy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  const touchRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = touch.clientX;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const relX = touch.clientX - rect.left;
      if (relX < CANVAS_W / 2) {
        gameState.current.keys.left = true;
        gameState.current.keys.right = false;
      } else {
        gameState.current.keys.right = true;
        gameState.current.keys.left = false;
      }
    }
  };
  const handleTouchEnd = () => {
    gameState.current.keys.left = false;
    gameState.current.keys.right = false;
    touchRef.current = null;
  };

  useEffect(() => {
    if (!playing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const gs = gameState.current;

    const gameLoop = () => {
      if (!gs.running) return;

      const p = gs.player;

      // Movement
      if (gs.keys.left) p.vx = -MOVE_SPEED;
      else if (gs.keys.right) p.vx = MOVE_SPEED;
      else p.vx = 0;

      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around sides
      if (p.x < -PLAYER_W) p.x = CANVAS_W;
      if (p.x > CANVAS_W) p.x = -PLAYER_W;

      // Platform collision (only when falling)
      if (p.vy > 0) {
        for (const plat of gs.platforms) {
          if (
            p.x + PLAYER_W > plat.x &&
            p.x < plat.x + plat.w &&
            p.y + PLAYER_H >= plat.y - gs.cameraY &&
            p.y + PLAYER_H <= plat.y - gs.cameraY + PLATFORM_H + p.vy
          ) {
            p.y = plat.y - gs.cameraY - PLAYER_H;
            p.vy = JUMP_FORCE;
          }
        }
      }

      // Camera follows player up
      if (p.y < CANVAS_H / 3) {
        const diff = CANVAS_H / 3 - p.y;
        p.y += diff;
        gs.cameraY += diff;
        gs.score = Math.max(gs.score, Math.floor(gs.cameraY / 10));
        setScore(gs.score);

        // Generate more platforms
        const highestPlat = Math.min(...gs.platforms.map(pl => pl.y));
        if (highestPlat > gs.cameraY - 200) {
          gs.platforms.push(...generatePlatforms(10, highestPlat - 80));
        }

        // Remove platforms below screen
        gs.platforms = gs.platforms.filter(pl => pl.y - gs.cameraY < CANVAS_H + 100);
      }

      // Game over: fell below screen
      if (p.y > CANVAS_H + 50) {
        gs.running = false;
        setPlaying(false);
        setGameOver(true);
        const finalScore = gs.score;
        setScore(finalScore);
        const prevHigh = Number(localStorage.getItem(highScoreKey) || '0');
        if (finalScore > prevHigh) {
          localStorage.setItem(highScoreKey, String(finalScore));
          setHighScore(finalScore);
        }
        return;
      }

      // Draw
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(1, '#60a5fa');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Stars (based on height)
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 137 + gs.cameraY * 0.1) % CANVAS_W;
        const sy = (i * 97 + gs.cameraY * 0.05) % CANVAS_H;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Platforms
      for (const plat of gs.platforms) {
        const py = plat.y - gs.cameraY;
        if (py > -20 && py < CANVAS_H + 20) {
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(plat.x, py, plat.w, PLATFORM_H);
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(plat.x, py + PLATFORM_H - 3, plat.w, 3);
        }
      }

      // Player (cat emoji as square)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(p.x, p.y, PLAYER_W, PLAYER_H);
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🐱', p.x + PLAYER_W / 2, p.y + PLAYER_H - 4);

      // Score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Rubik, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${gs.score}`, 10, 30);

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [playing]);

  return (
    <div className="space-y-4 text-center" dir="ltr">
      <h2 className="text-2xl font-bold text-gray-800">🚀 Sky Climber</h2>
      <p className="text-gray-500 text-sm">Jump between platforms and climb as high as you can!</p>

      <div className="inline-flex items-center gap-4 text-sm">
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">
          ⚡ {energy} energy
        </span>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
          🏆 High: {highScore}
        </span>
      </div>

      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-xl border-2 border-gray-300 bg-blue-900 block mx-auto"
          style={{ maxWidth: '100%', touchAction: 'none' }}
        />

        {!playing && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
            <div className="text-6xl mb-4">🚀</div>
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
            <p className="text-white/70 text-xs mt-3">Use arrow keys or tap left/right to move</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
            <div className="text-5xl mb-2">💥</div>
            <p className="text-white text-2xl font-bold">Game Over!</p>
            <p className="text-yellow-300 text-xl font-bold mt-1">Score: {score}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={startGame}
                disabled={!canPlay}
                className={`px-6 py-2 rounded-xl font-bold transition-all border-none cursor-pointer ${
                  canPlay
                    ? 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {canPlay ? `Retry (⚡${ENERGY_COST})` : 'No energy'}
              </button>
              <button
                onClick={() => navigate('/cats')}
                className="px-6 py-2 rounded-xl font-bold bg-white/20 hover:bg-white/30 text-white transition-all border-none cursor-pointer"
              >
                Shop
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/cats')}
        className="w-full bg-white hover:bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-lg transition-colors border-2 border-gray-200 cursor-pointer"
      >
        Back to Shop
      </button>
    </div>
  );
}

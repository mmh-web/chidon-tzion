import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { cats } from '../data/cats';

const CANVAS_W = 360;
const CANVAS_H = 300;
const GROUND_Y = CANVAS_H - 40;
const PLAYER_SIZE = 36;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const ENERGY_COST = 150;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  type: 'rock' | 'cactus' | 'bird';
}

export function CatRunnerPage() {
  const navigate = useNavigate();
  const { progress, spendEnergy } = useProgress();
  const energy = progress.energy || 0;
  const ownedCats = progress.ownedCats || [];
  const canPlay = energy >= ENERGY_COST;

  // Pick avatar: first owned cat, or default emoji
  const avatarCat = cats.find(c => ownedCats.includes(c.id));
  const avatarEmoji = avatarCat?.emoji || '🐱';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    Number(localStorage.getItem('chidon-catrunner-high') || '0')
  );
  const [gameOver, setGameOver] = useState(false);

  // Load cat image if available
  const catImgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (avatarCat?.image) {
      const img = new Image();
      img.src = avatarCat.image;
      img.onload = () => { catImgRef.current = img; };
    }
  }, [avatarCat]);

  const gs = useRef({
    playerY: GROUND_Y - PLAYER_SIZE,
    vy: 0,
    jumping: false,
    obstacles: [] as Obstacle[],
    speed: 4,
    score: 0,
    frameCount: 0,
    running: false,
  });

  const startGame = useCallback(() => {
    if (!canPlay) return;
    const spent = spendEnergy(ENERGY_COST);
    if (!spent) return;

    const g = gs.current;
    g.playerY = GROUND_Y - PLAYER_SIZE;
    g.vy = 0;
    g.jumping = false;
    g.obstacles = [];
    g.speed = 4;
    g.score = 0;
    g.frameCount = 0;
    g.running = true;

    setPlaying(true);
    setGameOver(false);
    setScore(0);
  }, [canPlay, spendEnergy]);

  // Jump on tap/space
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'ArrowUp') && !gs.current.jumping && gs.current.running) {
        gs.current.vy = JUMP_FORCE;
        gs.current.jumping = true;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTap = () => {
    if (!gs.current.jumping && gs.current.running) {
      gs.current.vy = JUMP_FORCE;
      gs.current.jumping = true;
    }
  };

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const g = gs.current;

    const gameLoop = () => {
      if (!g.running) return;
      g.frameCount++;

      // Player gravity
      g.vy += GRAVITY;
      g.playerY += g.vy;
      if (g.playerY >= GROUND_Y - PLAYER_SIZE) {
        g.playerY = GROUND_Y - PLAYER_SIZE;
        g.vy = 0;
        g.jumping = false;
      }

      // Speed up over time
      g.speed = 4 + g.score * 0.02;

      // Spawn obstacles
      if (g.frameCount % Math.max(40, 80 - Math.floor(g.score / 5)) === 0) {
        const type = Math.random() > 0.7 ? 'bird' : Math.random() > 0.5 ? 'cactus' : 'rock';
        const h = type === 'bird' ? 20 : type === 'cactus' ? 40 : 25;
        const w = type === 'bird' ? 25 : type === 'cactus' ? 15 : 30;
        g.obstacles.push({
          x: CANVAS_W + 20,
          w,
          h,
          type,
        });
      }

      // Move obstacles
      for (const obs of g.obstacles) {
        obs.x -= g.speed;
      }
      g.obstacles = g.obstacles.filter(o => o.x > -50);

      // Collision
      const px = 40;
      const py = g.playerY;
      for (const obs of g.obstacles) {
        const obsY = obs.type === 'bird' ? GROUND_Y - 60 : GROUND_Y - obs.h;
        if (
          px + PLAYER_SIZE - 8 > obs.x &&
          px + 8 < obs.x + obs.w &&
          py + PLAYER_SIZE - 4 > obsY &&
          py + 4 < obsY + obs.h
        ) {
          g.running = false;
          setPlaying(false);
          setGameOver(true);
          const finalScore = g.score;
          setScore(finalScore);
          const prevHigh = Number(localStorage.getItem('chidon-catrunner-high') || '0');
          if (finalScore > prevHigh) {
            localStorage.setItem('chidon-catrunner-high', String(finalScore));
            setHighScore(finalScore);
          }
          return;
        }
      }

      // Score
      g.score = Math.floor(g.frameCount / 6);
      setScore(g.score);

      // Draw
      // Sky
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Clouds
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 150 + g.frameCount * 0.3) % (CANVAS_W + 80)) - 40;
        ctx.beginPath();
        ctx.arc(cx, 40 + i * 25, 20, 0, Math.PI * 2);
        ctx.arc(cx + 20, 35 + i * 25, 25, 0, Math.PI * 2);
        ctx.arc(cx + 40, 40 + i * 25, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, GROUND_Y, CANVAS_W, 5);

      // Obstacles
      for (const obs of g.obstacles) {
        const obsY = obs.type === 'bird' ? GROUND_Y - 60 : GROUND_Y - obs.h;
        if (obs.type === 'cactus') {
          ctx.fillStyle = '#2d8a4e';
          ctx.fillRect(obs.x, obsY, obs.w, obs.h);
        } else if (obs.type === 'rock') {
          ctx.fillStyle = '#6b7280';
          ctx.fillRect(obs.x, obsY, obs.w, obs.h);
        } else {
          ctx.font = '20px serif';
          ctx.fillText('🦅', obs.x, obsY + 18);
        }
      }

      // Player
      if (catImgRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px + PLAYER_SIZE / 2, py + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(catImgRef.current, px, py, PLAYER_SIZE, PLAYER_SIZE);
        ctx.restore();
      } else {
        ctx.font = '28px serif';
        ctx.fillText(avatarEmoji, px, py + PLAYER_SIZE - 4);
      }

      // Score
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 16px Rubik, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${g.score}`, CANVAS_W - 10, 25);
      ctx.textAlign = 'left';

      animFrame = requestAnimationFrame(gameLoop);
    };

    animFrame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [playing, avatarEmoji]);

  return (
    <div className="space-y-4 text-center" dir="ltr">
      <h2 className="text-2xl font-bold text-gray-800">🏃 Cat Runner</h2>
      <p className="text-gray-500 text-sm">
        {avatarCat ? `Running as ${avatarCat.name}!` : 'Buy a cat in the shop for a custom avatar!'}
        {' '}Tap or press Space to jump!
      </p>

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
          onClick={handleTap}
          onTouchStart={handleTap}
          className="rounded-xl border-2 border-gray-300 block mx-auto"
          style={{ maxWidth: '100%', touchAction: 'none' }}
        />

        {!playing && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-xl">
            <div className="text-5xl mb-3">{avatarCat?.emoji || '🐱'}</div>
            <button
              onClick={startGame}
              disabled={!canPlay}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-none cursor-pointer ${
                canPlay
                  ? 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {canPlay ? `Run! (⚡${ENERGY_COST})` : `Need ⚡${ENERGY_COST} energy`}
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
            <div className="text-4xl mb-2">💥</div>
            <p className="text-white text-xl font-bold">Score: {score}</p>
            <div className="flex gap-3 mt-3">
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

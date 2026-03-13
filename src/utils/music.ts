// Multi-track chiptune music using Web Audio API
let audioContext: AudioContext | null = null;
let isPlaying = false;
let timeoutIds: number[] = [];
let currentTrackId = '';

type Note = [number, number]; // [frequency, duration in beats]

const BEAT_DURATION = 0.22;

// Track 1: Cheerful (Hava Nagila-inspired)
const cheerfulMelody: Note[] = [
  [329.63, 1], [349.23, 0.5], [392.00, 0.5], [440.00, 1],
  [392.00, 0.5], [349.23, 0.5], [329.63, 1], [293.66, 1],
  [329.63, 1], [349.23, 0.5], [392.00, 0.5], [440.00, 0.5],
  [493.88, 0.5], [440.00, 1], [392.00, 1],
  [349.23, 0.5], [329.63, 0.5], [349.23, 1], [392.00, 1],
  [440.00, 1], [493.88, 0.5], [523.25, 0.5], [493.88, 1],
  [440.00, 1], [392.00, 0.5], [349.23, 0.5], [329.63, 2],
];

// Track 2: Chill / Lo-fi style
const chillMelody: Note[] = [
  [261.63, 1.5], [329.63, 1], [392.00, 1.5], [349.23, 1],
  [293.66, 1.5], [349.23, 1], [329.63, 2],
  [261.63, 1], [293.66, 1], [329.63, 1.5], [392.00, 1],
  [349.23, 1.5], [329.63, 1], [293.66, 1], [261.63, 2],
  [392.00, 1.5], [349.23, 1], [329.63, 1.5], [293.66, 1],
  [261.63, 1], [293.66, 1], [329.63, 2],
];

// Track 3: Epic / Adventure
const epicMelody: Note[] = [
  [196.00, 0.5], [261.63, 0.5], [329.63, 0.5], [392.00, 1],
  [329.63, 0.5], [392.00, 0.5], [440.00, 0.5], [523.25, 1.5],
  [493.88, 0.5], [440.00, 0.5], [392.00, 1], [329.63, 0.5],
  [392.00, 1.5],
  [196.00, 0.5], [261.63, 0.5], [329.63, 0.5], [440.00, 1],
  [523.25, 0.5], [587.33, 0.5], [523.25, 0.5], [440.00, 1],
  [392.00, 0.5], [329.63, 0.5], [261.63, 1], [196.00, 2],
];

// Track 4: Dance / Party
const danceMelody: Note[] = [
  [329.63, 0.5], [329.63, 0.5], [493.88, 1], [440.00, 0.5], [392.00, 0.5],
  [329.63, 0.5], [329.63, 0.5], [293.66, 0.5], [329.63, 1],
  [440.00, 0.5], [440.00, 0.5], [523.25, 1], [493.88, 0.5], [440.00, 0.5],
  [392.00, 0.5], [440.00, 0.5], [392.00, 0.5], [329.63, 1],
  [329.63, 0.5], [392.00, 0.5], [440.00, 0.5], [493.88, 0.5],
  [523.25, 1], [493.88, 0.5], [440.00, 0.5], [392.00, 1],
  [329.63, 0.5], [293.66, 0.5], [329.63, 2],
];

// Track 5: Ani Maamin by TAI (Tai Gerszberg) — Bm, 120 BPM feel
// B3=246.94 C#4=277.18 D4=293.66 E4=329.63 F#4=369.99 G4=392.00 A4=440.00 B4=493.88
const aniMaaminMelody: Note[] = [
  // Verse: "Ani maamin..." — slow, plaintive opening in Bm
  [246.94, 2], [293.66, 1], [329.63, 1], [369.99, 2], [329.63, 2],
  [293.66, 1], [329.63, 1], [369.99, 1], [329.63, 1], [293.66, 2], [246.94, 2],
  // Rising: "be'emuna shelema..."
  [293.66, 1], [369.99, 1], [392.00, 2], [440.00, 1], [392.00, 1],
  [369.99, 2], [329.63, 1], [293.66, 1], [329.63, 2],
  // Chorus climb: emotional peak
  [369.99, 1], [440.00, 1], [493.88, 2], [440.00, 1], [392.00, 1],
  [440.00, 2], [493.88, 1], [440.00, 1], [392.00, 1], [369.99, 1], [329.63, 2],
  // Resolve back down
  [369.99, 1], [329.63, 1], [293.66, 2], [329.63, 1], [293.66, 1], [246.94, 3],
];

export interface MusicTrack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  waveType: OscillatorType;
  tempo: number;
  melody: Note[];
}

export const musicTracks: MusicTrack[] = [
  { id: 'cheerful', name: 'Cheerful Tune', emoji: '🎵', description: 'A happy melody to keep you motivated!', price: 25, waveType: 'square', tempo: 1, melody: cheerfulMelody },
  { id: 'chill', name: 'Chill Vibes', emoji: '🎧', description: 'Relaxed lo-fi beats for focused studying', price: 35, waveType: 'sine', tempo: 1.4, melody: chillMelody },
  { id: 'epic', name: 'Epic Quest', emoji: '⚔️', description: 'Adventure music for brave learners!', price: 50, waveType: 'sawtooth', tempo: 1.1, melody: epicMelody },
  { id: 'dance', name: 'Dance Party', emoji: '🕺', description: 'Get your groove on while you study!', price: 40, waveType: 'square', tempo: 0.85, melody: danceMelody },
  { id: 'ani-maamin', name: 'Ani Maamin', emoji: '🕊️', description: 'TAI — beautiful & emotional', price: 30, waveType: 'sine', tempo: 2.2, melody: aniMaaminMelody },
];

function playNote(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number, waveType: OscillatorType) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(volume * 0.06, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playMelodyLoop(track: MusicTrack) {
  if (!audioContext || !isPlaying || currentTrackId !== track.id) return;

  const ctx = audioContext;
  const now = ctx.currentTime + 0.1;
  const beatDur = BEAT_DURATION * track.tempo;
  let time = now;

  for (const [freq, beats] of track.melody) {
    const duration = beats * beatDur;
    playNote(ctx, freq, time, duration, 1, track.waveType);
    playNote(ctx, freq * 0.75, time, duration, 0.3, 'sine');
    time += duration;
  }

  const totalDuration = track.melody.reduce((sum, [, beats]) => sum + beats * beatDur, 0);

  const id = window.setTimeout(() => {
    if (isPlaying && currentTrackId === track.id) playMelodyLoop(track);
  }, (totalDuration - 0.1) * 1000);
  timeoutIds.push(id);
}

export function startMusic(trackId?: string) {
  const id = trackId || currentTrackId || 'cheerful';
  const track = musicTracks.find(t => t.id === id);
  if (!track) return;

  // If switching tracks, stop first
  if (isPlaying && currentTrackId !== id) {
    stopMusic();
  }

  if (isPlaying) return;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  currentTrackId = id;
  isPlaying = true;
  playMelodyLoop(track);
}

export function stopMusic() {
  isPlaying = false;
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

export function isMusicPlaying() {
  return isPlaying;
}

export function getCurrentTrackId() {
  return currentTrackId;
}

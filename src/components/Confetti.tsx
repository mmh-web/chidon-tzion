import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  trigger: boolean;
  intensity?: 'small' | 'big';
}

export function Confetti({ trigger, intensity = 'small' }: Props) {
  useEffect(() => {
    if (!trigger) return;

    if (intensity === 'big') {
      // Big celebration
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#0038b8', '#ffffff', '#f5c842'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#0038b8', '#ffffff', '#f5c842'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0038b8', '#ffffff', '#f5c842'],
      });
    }
  }, [trigger, intensity]);

  return null;
}

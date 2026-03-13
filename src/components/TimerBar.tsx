import { useEffect, useState, useRef } from 'react';

interface Props {
  seconds: number;
  onTimeout: () => void;
  paused: boolean;
  questionKey: string;
}

export function TimerBar({ seconds, onTimeout, paused, questionKey }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const timeoutCalled = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    timeoutCalled.current = false;
  }, [questionKey, seconds]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          if (!timeoutCalled.current) {
            timeoutCalled.current = true;
            setTimeout(onTimeout, 0);
          }
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [paused, onTimeout, questionKey]);

  const percentage = (remaining / seconds) * 100;
  const isWarning = remaining <= 5;
  const isCritical = remaining <= 3;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold ${isCritical ? 'text-red-500 timer-warning' : isWarning ? 'text-orange-500' : 'text-gray-500'}`}>
          ⏱️ {Math.ceil(remaining)} seconds
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full timer-bar ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-israel-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface CountdownTimerProps {
  durationMinutes?: number;
  onExpire?: () => void;
  className?: string;
  showWarning?: boolean;
  warningThresholdMinutes?: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  durationMinutes = 15,
  onExpire,
  className = '',
  showWarning = true,
  warningThresholdMinutes = 5,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired, onExpire]);

  useEffect(() => {
    if (showWarning && timeLeft <= warningThresholdMinutes * 60 && timeLeft > 0) {
      setIsWarning(true);
    } else {
      setIsWarning(false);
    }
  }, [timeLeft, showWarning, warningThresholdMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 ${className}`}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold text-sm">Tempo esgotado — a reserva foi liberada</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${
      isWarning
        ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse-subtle'
        : 'bg-[#faf7fb] border-[#dac9df] text-[#382343]'
    } ${className}`}>
      <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-current/20">
        <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-600 animate-bounce' : 'text-[#8a5d96]'}`} />
        <span className="font-mono font-bold text-base tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <span className="text-xs font-medium hidden sm:block">
        {isWarning 
          ? 'Reserva garantida por tempo limitado' 
          : 'Suas peças estão reservadas'}
      </span>
      <div className="hidden md:block h-2 flex-1 max-w-32 bg-white/50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isWarning ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-[#dac9df] to-[#8a5d96]'
          }`}
          style={{ width: `${(timeLeft / (durationMinutes * 60)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export const useCountdownTimer = (durationMinutes: number = 15) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isExpired) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isExpired]);

  const reset = () => {
    setTimeLeft(durationMinutes * 60);
    setIsExpired(false);
  };

  return { timeLeft, isExpired, reset, formatTime: (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }};
};
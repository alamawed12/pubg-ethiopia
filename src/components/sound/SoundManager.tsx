'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

export type SoundEffect = 'click' | 'hover' | 'success' | 'ambient';

export interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (name: SoundEffect | string) => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: true,
  toggleMute: () => {},
  playSound: () => {},
});

export const useSoundContext = () => useContext(SoundContext);

const STORAGE_KEY = 'sound-pref';

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasReducedMotion, setHasReducedMotion] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Initialize preference and reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Check stored sound preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'unmuted' && !motionQuery.matches) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Helper to ensure AudioContext is active
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  // Continuous low brown noise ambient generator
  const stopAmbient = useCallback(() => {
    if (ambientGainRef.current && audioCtxRef.current) {
      try {
        const now = audioCtxRef.current.currentTime;
        ambientGainRef.current.gain.cancelScheduledValues(now);
        ambientGainRef.current.gain.setValueAtTime(ambientGainRef.current.gain.value, now);
        ambientGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.3);
      } catch {
        // Safe catch
      }
    }
    setTimeout(() => {
      if (ambientSourceRef.current) {
        try {
          ambientSourceRef.current.stop();
          ambientSourceRef.current.disconnect();
        } catch {
          // Already stopped
        }
        ambientSourceRef.current = null;
      }
      if (ambientGainRef.current) {
        try {
          ambientGainRef.current.disconnect();
        } catch {
          // Disconnected
        }
        ambientGainRef.current = null;
      }
    }, 350);
  }, []);

  const startAmbient = useCallback(() => {
    if (isMuted || hasReducedMotion) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ambientSourceRef.current) {
      return; // Already running
    }

    try {
      // 5 seconds brown noise buffer looped
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.0);

      // Low pass filter to remove harshness
      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.setValueAtTime(200, ctx.currentTime);

      noiseSource.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(0);
      ambientSourceRef.current = noiseSource;
      ambientGainRef.current = gainNode;
    } catch {
      // Audio context autoplay restrictions or failure
    }
  }, [getAudioContext, hasReducedMotion, isMuted]);

  // Handle ambient on mute state change
  useEffect(() => {
    if (isMuted || hasReducedMotion) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }, [isMuted, hasReducedMotion, startAmbient, stopAmbient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAmbient]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, next ? 'muted' : 'unmuted');
      }
      return next;
    });
  }, []);

  const playSound = useCallback(
    (name: SoundEffect | string) => {
      if (isMuted || hasReducedMotion) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (name) {
        case 'click': {
          // Short 800Hz sine beep, 50ms, very quiet (gain 0.05)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'hover': {
          // Shorter 600Hz sine, 30ms, gain 0.03
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);

          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'success': {
          // Ascending tone 400->800Hz, 200ms, gain 0.08
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'ambient': {
          startAmbient();
          break;
        }

        default:
          break;
      }
    },
    [getAudioContext, hasReducedMotion, isMuted, startAmbient]
  );

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export default SoundProvider;

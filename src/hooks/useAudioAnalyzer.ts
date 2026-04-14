import { useRef, useCallback, useEffect, useState } from 'react';

interface AudioAnalysis {
  bass: number;
  mid: number;
  treble: number;
  average: number;
}

export function useAudioAnalyzer(audioRef: React.RefObject<HTMLAudioElement>) {
  const contextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysis>({ bass: 0, mid: 0, treble: 0, average: 0 });
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    const audioElement = audioRef.current;
    if (!audioElement || connectedRef.current) return;

    try {
      const ctx = new AudioContext();
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioElement);
      source.connect(analyzer);
      analyzer.connect(ctx.destination);

      contextRef.current = ctx;
      analyzerRef.current = analyzer;
      sourceRef.current = source;
      dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
      connectedRef.current = true;
    } catch (err) {
      console.warn('Audio analyzer failed to connect:', err);
    }
  }, [audioRef]);

  useEffect(() => {
    const tick = () => {
      if (!analyzerRef.current || !dataArrayRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analyzerRef.current.getByteFrequencyData(dataArrayRef.current as any);
      const data = dataArrayRef.current;
      const len = data.length;

      const bassEnd = Math.floor(len * 0.15);
      const midEnd = Math.floor(len * 0.5);

      let bassSum = 0, midSum = 0, trebleSum = 0;

      for (let i = 0; i < bassEnd; i++) bassSum += data[i];
      for (let i = bassEnd; i < midEnd; i++) midSum += data[i];
      for (let i = midEnd; i < len; i++) trebleSum += data[i];

      const bass = bassSum / (bassEnd * 255);
      const mid = midSum / ((midEnd - bassEnd) * 255);
      const treble = trebleSum / ((len - midEnd) * 255);
      const average = (bass + mid + treble) / 3;

      setAnalysis({ bass, mid, treble, average });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handlePlay = () => {
      connect();
      if (contextRef.current?.state === 'suspended') {
        contextRef.current.resume();
      }
    };

    audioElement.addEventListener('play', handlePlay);
    return () => audioElement.removeEventListener('play', handlePlay);
  }, [audioRef, connect]);

  return analysis;
}

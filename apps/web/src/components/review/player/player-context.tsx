"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject
} from "react";

export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface PlayerContextValue {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  src: string;
  fps: number;
  aspectRatio: number;
  currentTime: number;
  duration: number;
  paused: boolean;
  playbackRate: PlaybackSpeed;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  currentFrame: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  stepFrame: (deltaFrames: number) => void;
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// Frame-accurate stepping needs a frames-per-second figure, but the app
// never probes the actual video file for it (no transcoding/metadata
// pipeline) - it reuses whatever the editor typed into the "Frame Rate"
// export-settings field at submit time, falling back to 24fps.
export function fpsFromExportSettings(
  exportSettings?: Record<string, string> | null
): number {
  const raw = exportSettings?.frameRate ?? exportSettings?.["Frame Rate"];
  const parsed = raw ? Number.parseFloat(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 24;
}

export function PlayerProvider({
  src,
  fps,
  children
}: {
  src: string;
  fps: number;
  children: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [paused, setPaused] = useState(true);
  const [playbackRate, setPlaybackRateState] = useState<PlaybackSpeed>(1);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setAspectRatio(16 / 9);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      }
    };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [src]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const play = useCallback(() => void videoRef.current?.play(), []);
  const pause = useCallback(() => videoRef.current?.pause(), []);
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);
  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(time, video.duration || time));
    video.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);
  const stepFrame = useCallback(
    (deltaFrames: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      const next = Math.max(0, video.currentTime + deltaFrames / fps);
      video.currentTime = next;
      setCurrentTime(next);
    },
    [fps]
  );
  const setPlaybackRate = useCallback((rate: PlaybackSpeed) => {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setPlaybackRateState(rate);
  }, []);
  const setVolume = useCallback(
    (next: number) => {
      const video = videoRef.current;
      if (video) video.volume = next;
      setVolumeState(next);
      if (next > 0 && muted) {
        if (video) video.muted = false;
        setMuted(false);
      }
    },
    [muted]
  );
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    const next = !muted;
    if (video) video.muted = next;
    setMuted(next);
  }, [muted]);
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  }, []);

  const currentFrame = Math.round(currentTime * fps);

  return (
    <PlayerContext.Provider
      value={{
        videoRef,
        containerRef,
        src,
        fps,
        aspectRatio,
        currentTime,
        duration,
        paused,
        playbackRate,
        volume,
        muted,
        fullscreen,
        currentFrame,
        play,
        pause,
        togglePlay,
        seek,
        stepFrame,
        setPlaybackRate,
        setVolume,
        toggleMute,
        toggleFullscreen
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
}

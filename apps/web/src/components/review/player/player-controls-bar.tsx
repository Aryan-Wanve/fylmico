"use client";

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PLAYBACK_SPEEDS, usePlayerContext } from "./player-context";
import { formatTimestamp } from "./player-format";

export function PlayerControlsBar() {
  const {
    paused,
    currentTime,
    duration,
    playbackRate,
    volume,
    muted,
    fullscreen,
    currentFrame,
    togglePlay,
    stepFrame,
    setPlaybackRate,
    setVolume,
    toggleMute,
    toggleFullscreen
  } = usePlayerContext();

  const remaining = Math.max(0, duration - currentTime);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#11142c] px-3 py-2 text-white">
      <button
        aria-label={paused ? "Play" : "Pause"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
        onClick={togglePlay}
        type="button"
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>

      <button
        aria-label="Previous frame"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => stepFrame(-1)}
        type="button"
      >
        <SkipBack className="h-3.5 w-3.5" />
      </button>
      <button
        aria-label="Next frame"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        onClick={() => stepFrame(1)}
        type="button"
      >
        <SkipForward className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-1.5 font-mono text-xs text-white/80">
        <span>{formatTimestamp(currentTime)}</span>
        <span className="text-white/30">/</span>
        <span>{formatTimestamp(duration)}</span>
        <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold">
          F{currentFrame}
        </span>
        <span className="text-white/40">-{formatTimestamp(remaining)}</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Select
          onValueChange={(next) => {
            if (next)
              setPlaybackRate(Number(next) as (typeof PLAYBACK_SPEEDS)[number]);
          }}
          value={String(playbackRate)}
        >
          <SelectTrigger className="h-8 w-[4.5rem] border-white/10 bg-white/5 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAYBACK_SPEEDS.map((speed) => (
              <SelectItem key={speed} value={String(speed)}>
                {speed}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value="source" onValueChange={() => {}}>
          <SelectTrigger className="h-8 w-24 border-white/10 bg-white/5 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="source">Source</SelectItem>
          </SelectContent>
        </Select>

        <button
          aria-label={muted ? "Unmute" : "Mute"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          onClick={toggleMute}
          type="button"
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <input
          aria-label="Volume"
          className="h-1 w-16 accent-[#654cff]"
          max={1}
          min={0}
          onChange={(event) => setVolume(Number(event.target.value))}
          step={0.05}
          type="range"
          value={muted ? 0 : volume}
        />

        <button
          aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          onClick={toggleFullscreen}
          type="button"
        >
          {fullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

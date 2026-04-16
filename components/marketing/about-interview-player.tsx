"use client";

import { useRef } from "react";

type AboutInterviewPlayerProps = {
  className?: string;
  poster: string;
  src: string;
  startTimeSeconds?: number;
  watchUrl: string;
};

export function AboutInterviewPlayer({
  className,
  poster,
  src,
  startTimeSeconds = 0,
  watchUrl,
}: AboutInterviewPlayerProps) {
  const hasSeekedRef = useRef(false);

  return (
    <video
      controls
      playsInline
      preload="none"
      poster={poster}
      data-start-seconds={startTimeSeconds}
      className={className}
      onLoadedMetadata={(event) => {
        if (hasSeekedRef.current || startTimeSeconds <= 0) {
          return;
        }

        const video = event.currentTarget;
        const maxStart = Number.isFinite(video.duration) ? Math.max(video.duration - 1, 0) : startTimeSeconds;
        const nextTime = Math.min(startTimeSeconds, maxStart);

        if (nextTime <= 0) {
          return;
        }

        try {
          video.currentTime = nextTime;
          hasSeekedRef.current = true;
        } catch {
          // Leave playback at the natural start if the browser rejects the initial seek.
        }
      }}
    >
      <source src={src} type="video/mp4" />
      <a href={watchUrl} target="_blank" rel="noreferrer">
        Watch the interview on YouTube
      </a>
    </video>
  );
}

// src/components/Visualizer.jsx
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Visualizer({ audioUrl, isPlaying, onReady, onPlay, onPause }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#000",
      cursorColor: "#555",
      barWidth: 2,
      responsive: true,
      height: 100,
    });

    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on("ready", () => {
      if (onReady) onReady(wavesurfer.current);
    });

    wavesurfer.current.on("play", () => {
      if (onPlay) onPlay();
    });

    wavesurfer.current.on("pause", () => {
      if (onPause) onPause();
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (wavesurfer.current) {
      isPlaying ? wavesurfer.current.play() : wavesurfer.current.pause();
    }
  }, [isPlaying]);

  return <div ref={waveformRef} className="w-full" />;
}

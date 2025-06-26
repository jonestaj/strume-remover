import React, { useRef, useEffect, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Pause, Play, X } from "lucide-react";

export default function MiniPlayer({ file, onClose }) {
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wavesurfer, setWavesurfer] = useState(null);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn("Playback error:", err);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const container = containerRef.current;
  
    if (!audio || !container || !file?.download_url) return;
  
    // Reset audio element
    audio.pause();
    audio.currentTime = 0;
    audio.src = file.download_url;
    audio.load();
  
    // Create WaveSurfer instance
    const ws = WaveSurfer.create({
      container,
      waveColor: "#d1d5db",
      progressColor: "#111827",
      backend: "MediaElement",
      media: audio,
      height: 40,
      responsive: true,
      cursorWidth: 1,
      interact: true,
    });
  
    setWavesurfer(ws);
  
    const delayPlay = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Delayed playback error:", err);
      }
    };
  
    delayPlay();
  
    // ✅ Cleanup function uses `ws` directly, not from state
    return () => {
      ws.destroy();
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    };
  }, [file?.download_url]);
  
  if (!file) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto z-50 max-w-md bg-white/30 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-black truncate">
          {file.title || "Untitled"} – {file.artist || "Unknown"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePlayback}
            className="p-2 bg-black text-white rounded-full hover:scale-110 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-800 text-white rounded-full hover:scale-110 transition-transform"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full"></div>
      <audio ref={audioRef} src={file.download_url} preload="auto" />
    </div>
  );
}

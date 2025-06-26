import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function ModalPlayer({ track, onClose }) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (track?.download_url && waveformRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgba(255, 255, 255, 0.4)",
        progressColor: "#fff",
        cursorColor: "#fff",
        barWidth: 3,
        height: 80,
        responsive: true,
        normalize: true,
      });

      wavesurfer.load(track.download_url);
      wavesurfer.on("ready", () => setIsPlaying(false));
      wavesurferRef.current = wavesurfer;
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [track]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  if (!track) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full text-white relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-white text-lg">
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-1">{track.title || "Untitled"}</h2>
        <p className="text-sm mb-6 text-white/80">{track.artist || "Unknown Artist"}</p>

        <div ref={waveformRef} className="mb-4" />

        <button
          onClick={togglePlay}
          className="w-20 h-20 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xl shadow-inner backdrop-blur-md"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>
    </div>
  );
}

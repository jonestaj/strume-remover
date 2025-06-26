import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function AudioModal({ track, onClose }) {
  const modalRef = useRef(null);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (track?.download_url && waveformRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgba(255, 255, 255, 0.3)",
        progressColor: "#fff",
        cursorColor: "#fff",
        barWidth: 3,
        height: 80,
        responsive: true,
        normalize: true,
        interact: true, // enable scrubbing
      });

      wavesurfer.load(track.download_url);
      wavesurfer.on("ready", () => setIsPlaying(false));
      wavesurfer.on("finish", () => setIsPlaying(false));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl text-white flex flex-col items-center"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
        >
          ✕
        </button>

        <div className="w-48 h-48 rounded-full bg-white/10 border border-white/20 shadow-inner flex items-center justify-center mb-4 relative">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-2xl"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
        </div>

        <div className="w-full mb-4 text-center">
          <p className="text-lg font-medium">{track.title || "Untitled"}</p>
          <p className="text-sm text-white/70">{track.artist || "Unknown Artist"}</p>
        </div>

        <div
          ref={waveformRef}
          className="w-full cursor-pointer"
          title="Click waveform to scrub"
        />
      </div>
    </div>
  );
}

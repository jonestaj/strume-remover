import React, { useEffect, useRef, useState } from "react";

export default function PlaybackModal({ track, onClose, onToggleMini }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const radius = 80;
      const cx = canvasRef.current.width / 2;
      const cy = canvasRef.current.height / 2;

      dataArray.forEach((v, i) => {
        const angle = (i / bufferLength) * 2 * Math.PI;
        const length = v * 0.5;
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + length);
        const y2 = cy + Math.sin(angle) * (radius + length);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    draw();
  }, [track]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="relative w-72 h-72 bg-white/70 border border-white/30 rounded-full shadow-xl flex flex-col justify-center items-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="absolute top-0 left-0 rounded-full"
        />
        <button
          onClick={togglePlayback}
          className="z-10 bg-black text-white p-4 rounded-full hover:bg-neutral-800 transition"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-700 hover:text-black text-sm"
        >
          Close
        </button>
        <button
          onClick={onToggleMini}
          className="absolute bottom-4 right-4 text-xs underline text-neutral-800"
        >
          Open Mini Player
        </button>
        <audio ref={audioRef} src={track.download_url} />
      </div>
    </div>
  );
}

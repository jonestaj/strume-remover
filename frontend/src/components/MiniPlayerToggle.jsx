import React from "react";
import { PlayCircle } from "lucide-react";

export default function MiniPlayerToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-white/30 backdrop-blur-md border border-white/40 shadow-lg p-3 rounded-full hover:scale-105 transition-transform"
      aria-label="Open Mini Player"
    >
      <PlayCircle size={32} className="text-black" />
    </button>
  );
}

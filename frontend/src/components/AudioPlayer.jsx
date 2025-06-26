import React, { useRef, useEffect } from "react";

export default function AudioPlayer({ url }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((err) => console.error("Playback error:", err));
    }
  }, [url]);

  return (
    <audio
      ref={audioRef}
      src={url}
      controls
      className="w-full outline-none"
    />
  );
}

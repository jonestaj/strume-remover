import React from "react";

export default function FileList({ files, onPlay, currentFile, onDelete }) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Your Tracks</h2>
      {files.map((file, i) => {
        const isActive = currentFile?.download_url === file.download_url;

        return (
          <div
            key={i}
            role="button"
            tabIndex={0}
            className={`group border rounded p-4 mb-4 backdrop-blur-md transition-all cursor-pointer ${
              isActive
                ? "bg-black/60 border-white text-white"
                : "bg-white/10 border-white/10 text-black hover:bg-white/20"
            }`}
            onClick={() => onPlay(file)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onPlay(file);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{file.title || "Untitled"}</p>
                <p className="text-sm opacity-70">{file.artist || "Unknown"}</p>
                <p className="text-xs opacity-50">{file.genre || "-"}</p>
              </div>
              {isActive && (
                <span className="text-xs text-green-400 font-semibold">
                  Now Playing
                </span>
              )}
            </div>

            <div className="flex justify-between items-center mt-2">
              <a
                href={file.download_url}
                className={`text-sm underline ${
                  isActive ? "text-white" : "text-black"
                }`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()} // Don't trigger card click
              >
                Download
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Don't trigger card click
                  onDelete(file.filename);
                }}
                className={`text-sm hover:underline ${
                  isActive ? "text-red-300" : "text-red-500"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

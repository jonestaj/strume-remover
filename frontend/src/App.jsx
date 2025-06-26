import React, { useState } from "react";
import FileList from "./components/FileList";
import AudioPlayer from "./components/AudioPlayer";
import Header from "./components/Header";
import UploadForm from "./components/UploadForm";
import MiniPlayerToggle from "./components/MiniPlayerToggle";
import MiniPlayer from "./components/MiniPlayer";

export default function App() {
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTrackUrl, setCurrentTrackUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);


  // Metadata fields to auto-fill
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const handleDelete = async (fileName) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: fileName,
          email: email, // use current user's email
        }),
      });
  
      if (!res.ok) throw new Error("Delete failed");
  
      alert("🗑️ File deleted!");
      onUploadSuccess(); // Refresh file list
    } catch (err) {
      alert("❌ Could not delete file.");
    }
  };
  

  const fetchFiles = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/files?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setFiles(data.files || []);
      if (!data.files?.length) setError("No files found.");
    } catch {
      setError("Error fetching files.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (url) => {
    setCurrentTrackUrl(url);
    setIsModalOpen(true);
  };

  // 🔍 New: Detect metadata
  const detectMetadata = async () => {
    if (!selectedFile) return alert("Please choose a file first.");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/detect-metadata", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTitle(data.title || "");
      setArtist(data.artist || "");
      setGenre(data.genre || "");
    } catch (err) {
      console.error("Metadata detection failed", err);
      alert("Failed to detect metadata.");
    }
  };
  {files.map((f) => (
    <div key={f.filename} className="flex items-center justify-between">
      <span>{f.title}</span>
      <audio controls src={`http://127.0.0.1:8000/download?file=${f.filename}`} />
      <button
        onClick={() => handleDelete(f.filename)}
        className="text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  ))}
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-gray-200 to-neutral-100 text-black font-sans">
      <Header />

      <main className="max-w-3xl mx-auto p-6">
        <UploadForm
          email={email}
          setEmail={setEmail}
          file={selectedFile}
          setFile={setSelectedFile}
          onUploadSuccess={fetchFiles}
          detectMetadata={detectMetadata}
          title={title}
          artist={artist}
          genre={genre}
          setTitle={setTitle}
          setArtist={setArtist}
          setGenre={setGenre}
        />

        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Search Your Tracks</h3>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-white/70 border border-gray-300 placeholder-gray-600"
            />
            <button
              onClick={fetchFiles}
              className="bg-black text-white px-4 py-2 rounded hover:bg-neutral-800"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </section>

        <FileList
        files={files}
        currentFile={currentFile}
        onPlay={setCurrentFile}
        onDelete={handleDelete}
      />
      
      {currentFile && (
        <MiniPlayer file={currentFile} onClose={() => setCurrentFile(null)} />
      )}
      </main>

      {isModalOpen && currentTrackUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full text-center relative">
            <button
              className="absolute top-3 right-4 text-black text-xl font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Now Playing</h3>
            <AudioPlayer url={currentTrackUrl} />
          </div>
        </div>
      )}

      {currentTrack && !showMiniPlayer && (
        <MiniPlayerToggle onClick={() => setShowMiniPlayer(true)} />
      )}

      {selectedFile && (
        <MiniPlayer
          file={currentFile}
          onClose={() => setCurrentFile(null)}
        />
      )}
    </div>
  );
}

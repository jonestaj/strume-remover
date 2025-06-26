import React, { useState, useRef, useEffect } from "react";

export default function UploadForm({ email, setEmail, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [keepFile, setKeepFile] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const eventSourceRef = useRef(null);

  const handleUpload = () => {
    if (!file || !email) {
      setUploadStatus("Please select a file and enter your email.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("genre", genre);
    formData.append("email", email);
    formData.append("keep_file", keepFile);

    const taskId = crypto.randomUUID();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://127.0.0.1:8000/separate?task_id=${taskId}`);

    xhr.onloadstart = () => {
      setShowProgress(true);
      setProgress(0);
      setUploadStatus("⏳ Uploading...");
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadStatus("⚙️ Separating vocals...");
        setProgress(60);

        eventSourceRef.current = new EventSource(`http://127.0.0.1:8000/progress/${taskId}`);

        eventSourceRef.current.onmessage = (event) => {
          const percent = parseInt(event.data);
          setProgress(percent);
          setUploadStatus(`🎚 Processing... ${percent}%`);

          if (percent >= 100) {
            setUploadStatus("✅ Done! Your instrumental is ready.");
            eventSourceRef.current.close();
            setShowProgress(false);
            setFile(null);
            setTitle("");
            setArtist("");
            setGenre("");
            onUploadSuccess();
          }

          if (percent === -1) {
            setUploadStatus("❌ Something went wrong during processing.");
            eventSourceRef.current.close();
            setShowProgress(false);
          }
        };

        eventSourceRef.current.onerror = () => {
          setUploadStatus("❌ Lost connection to server.");
          eventSourceRef.current.close();
          setShowProgress(false);
        };
      } else {
        setUploadStatus("❌ Upload failed.");
        setShowProgress(false);
      }
    };

    xhr.onerror = () => {
      setUploadStatus("❌ Network error during upload.");
      setShowProgress(false);
    };

    xhr.send(formData);
  };

  const handleDetectMetadata = async () => {
    if (!file) {
      setUploadStatus("❗ Please select a file first.");
      return;
    }

    setDetecting(true);
    setUploadStatus("🔍 Detecting metadata...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/detect-metadata", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Detection failed");

      const data = await res.json();
      console.log("Metadata response:", data);
      setTitle(data.title || "");
      setArtist(data.artist || "");
      setGenre(data.genre || "");
      setUploadStatus("✅ Metadata detected!");
    } catch (err) {
      setUploadStatus("❌ Failed to detect metadata.");
    } finally {
      setDetecting(false);
    }
  };

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <section className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-black">Upload Track</h2>
      <div className="grid gap-3">
        <input
          type="file"
          accept=".mp3,.wav"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          onClick={handleDetectMetadata}
          disabled={detecting || !file}
          className="bg-white text-black px-4 py-2 rounded border hover:bg-gray-100 transition"
        >
          {detecting ? "Detecting..." : "Detect Metadata"}
        </button>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 rounded bg-white/80 border border-gray-300 placeholder-gray-600"
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="px-3 py-2 rounded bg-white/80 border border-gray-300 placeholder-gray-600"
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-3 py-2 rounded bg-white/80 border border-gray-300 placeholder-gray-600"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded bg-white/80 border border-gray-300 placeholder-gray-600"
        />
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={keepFile}
            onChange={(e) => setKeepFile(e.target.checked)}
          />
          <span>Keep this file for later download</span>
        </label>
        <button
          onClick={handleUpload}
          className="bg-black text-white px-4 py-2 rounded hover:bg-neutral-800"
        >
          Upload
        </button>
        {uploadStatus && <p className="text-sm text-black">{uploadStatus}</p>}
        {showProgress && (
          <div className="w-full bg-gray-300 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

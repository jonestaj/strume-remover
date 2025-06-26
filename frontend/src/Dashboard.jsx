import { useState } from "react";
import strumeLogo from "./assets/logo.png";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [keepFile, setKeepFile] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data.files?.length) {
        setFiles(data.files);
      } else {
        setFiles([]);
        setError("No files found.");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching files.");
    }
    setLoading(false);
  };

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

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8000/separate");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    });

    xhr.onloadstart = () => {
      setShowProgress(true);
      setProgress(0);
      setUploadStatus("⏳ Uploading...");
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadStatus("✅ Upload complete!");
        fetchFiles();
      } else {
        setUploadStatus("❌ Upload failed.");
      }
      setShowProgress(false);
    };

    xhr.onerror = () => {
      setUploadStatus("❌ Network error during upload.");
      setShowProgress(false);
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white backdrop-blur-sm bg-opacity-70 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <img src={strumeLogo} alt="Strume Logo" className="h-12 mb-8" />

        <div className="bg-white bg-opacity-10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📤 Upload a New Track</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="file"
              accept=".mp3,.wav"
              onChange={(e) => setFile(e.target.files[0])}
              className="bg-transparent border border-white p-2 rounded"
            />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border border-white p-2 rounded"
            />
            <input
              type="text"
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="bg-transparent border border-white p-2 rounded"
            />
            <input
              type="text"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-transparent border border-white p-2 rounded"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-white p-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepFile}
                onChange={(e) => setKeepFile(e.target.checked)}
              />
              Keep this file for later download
            </label>
            <button
              onClick={handleUpload}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Upload
            </button>
            {uploadStatus && <p className="text-sm mt-1">{uploadStatus}</p>}
            {showProgress && (
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-black h-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold mt-10 mb-6 text-center">🎧 Your Stored Tracks</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border border-white px-4 py-2 w-full rounded"
          />
          <button
            onClick={fetchFiles}
            disabled={loading || !email}
            className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {files.map((file, idx) => (
          <div
            key={idx}
            className="bg-white bg-opacity-10 border border-white p-4 rounded mb-4"
          >
            <p>
              <strong>Title:</strong> {file.title || "Untitled"}
            </p>
            <p>
              <strong>Artist:</strong> {file.artist || "Unknown"}
            </p>
            <p>
              <strong>Genre:</strong> {file.genre || "-"}
            </p>
            <a
              href={file.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline text-sm mt-2 inline-block"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

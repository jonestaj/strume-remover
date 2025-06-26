import { useState } from "react";

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
      const res = await fetch(`http://127.0.0.1:8000/files?email=${encodeURIComponent(email)}`);
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
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center flex justify-center items-start py-10 px-4">
      <div className="backdrop-blur-md bg-white/60 p-6 rounded-xl w-full max-w-2xl shadow-lg">
        
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Strume logo"
            className="w-36 h-auto object-contain"
          />
        </div>

        <h2 className="text-xl font-semibold mb-4">📤 Upload a New Track</h2>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <input type="file" accept=".mp3,.wav" onChange={(e) => setFile(e.target.files[0])} />
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border px-3 py-2 rounded" />
          <input type="text" placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} className="border px-3 py-2 rounded" />
          <input type="text" placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="border px-3 py-2 rounded" />
          <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border px-3 py-2 rounded" />
          
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={keepFile} onChange={(e) => setKeepFile(e.target.checked)} />
            Keep this file for later download
          </label>

          <button onClick={handleUpload} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900">
            Upload
          </button>

          {uploadStatus && <p className="text-sm text-gray-700">{uploadStatus}</p>}
          
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2 overflow-hidden">
              <div className="bg-black h-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">🎧 Your Stored Tracks</h1>

        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-full"
          />
          <button
            onClick={fetchFiles}
            disabled={loading || !email}
            className="bg-black text-white px-4 py-2 rounded w-full sm:w-auto hover:bg-gray-900"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {files.map((file, idx) => (
          <div key={idx} className="border border-gray-300 rounded p-4 mb-4 bg-white/80">
            <p><strong>Title:</strong> {file.title || "Untitled"}</p>
            <p><strong>Artist:</strong> {file.artist || "Unknown"}</p>
            <p><strong>Genre:</strong> {file.genre || "-"}</p>
            <a
              href={file.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline text-sm mt-2 inline-block"
            >
              ⬇️ Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Header } from "../components/Header";
import { UploadForm } from "../components/UploadForm";
import { FileList } from "../components/FileList";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    if (!email) return;
    const res = await fetch(`http://127.0.0.1:8000/files?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.files) setFiles(data.files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 text-gray-900 dark:text-white">
      <Header />
      <main className="max-w-2xl mx-auto p-6">
        <UploadForm email={email} setEmail={setEmail} onUploadComplete={fetchFiles} />
        <FileList files={files} />
      </main>
    </div>
  );
}

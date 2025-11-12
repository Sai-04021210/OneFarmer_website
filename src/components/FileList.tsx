'use client';

import { useState, useEffect } from 'react';

export default function FileList() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data.files);
    };
    fetchFiles();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file} className="flex justify-between items-center mb-2">
            <span>{file}</span>
            <a
              href={`/uploads/${file}`}
              download
              className="text-blue-500 hover:underline"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

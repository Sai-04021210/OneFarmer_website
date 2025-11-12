'use client';

import { useState, useEffect } from 'react';
import withAdminAuth from '@/components/withAdminAuth';

function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [content, setContent] = useState({ hero: { title: '', subtitle: '' } });
  const [contentMessage, setContentMessage] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    };
    fetchContent();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMessage('');

    if (!file) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setUploadMessage(`File uploaded successfully: ${data.path}`);
    } else {
      setUploadMessage(`Error: ${data.message}`);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    setContent((prevContent) => ({
      ...prevContent,
      [section]: {
        ...prevContent[section],
        [field]: value,
      },
    }));
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentMessage('');

    const res = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });

    const data = await res.json();

    if (data.success) {
      setContentMessage('Content updated successfully!');
    } else {
      setContentMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg text-gray-600 mb-8">
        Welcome to the admin dashboard. This is a protected area.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">File Upload</h2>
          <form onSubmit={handleUploadSubmit}>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Upload
            </button>
          </form>
          {uploadMessage && <p className="mt-4">{uploadMessage}</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Edit Hero Content</h2>
          <form onSubmit={handleContentSubmit}>
            <div className="mb-4">
              <label htmlFor="hero.location" className="block font-bold mb-2">
                Location
              </label>
              <input
                type="text"
                id="hero.location"
                name="hero.location"
                value={content.hero.location}
                onChange={handleContentChange}
                className="border rounded w-full py-2 px-3"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="hero.title" className="block font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                id="hero.title"
                name="hero.title"
                value={content.hero.title}
                onChange={handleContentChange}
                className="border rounded w-full py-2 px-3"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="hero.subtitle" className="block font-bold mb-2">
                Subtitle
              </label>
              <input
                type="text"
                id="hero.subtitle"
                name="hero.subtitle"
                value={content.hero.subtitle}
                onChange={handleContentChange}
                className="border rounded w-full py-2 px-3"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Content
            </button>
          </form>
          {contentMessage && <p className="mt-4">{contentMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);

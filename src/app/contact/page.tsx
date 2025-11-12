'use client';

import { useState, useEffect } from 'react';
import { Mail, Github, Linkedin, Send, Sprout, Moon, Sun } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create a mailto link
    const mailtoLink = `mailto:sairammakkapati@outlook.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Sprout className="w-16 h-16" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Have questions about hydroponics or the #OneFarmer journey?
              Want to share your own urban farming experiences? I&apos;d love to hear from you!
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Connect
              </h2>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Share your ideas, ask questions, or just say hello!
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</h3>
                  <a
                    href="mailto:sairammakkapati@outlook.com"
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    sairammakkapati@outlook.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className={`font-semibold mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Social Media</h3>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Sai-04021210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/makkapati-sai-ram/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`lg:col-span-2 rounded-xl shadow-lg p-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                Send Message
                <Send className="ml-2 w-4 h-4" />
              </button>
            </form>

            <div className={`mt-6 p-4 rounded-lg ${
              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
            }`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This form will open your email client. You can also email me directly at{' '}
                <a href="mailto:sairammakkapati@outlook.com" className="text-green-600 hover:text-green-700 font-medium">
                  sairammakkapati@outlook.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

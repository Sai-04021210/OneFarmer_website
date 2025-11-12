'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, Sprout, Sun } from 'lucide-react';

export default function GreensPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);
  const greens = [
    {
      name: 'Lettuce',
      status: 'planned',
      description: 'Coming soon - Fresh lettuce varieties',
      color: 'green',
      available: false
    },
    {
      name: 'Spinach',
      status: 'planned',
      description: 'Coming soon - Nutritious spinach cultivation',
      color: 'emerald',
      available: false
    },
    {
      name: 'Kale',
      status: 'planned',
      description: 'Coming soon - Superfood kale growing guide',
      color: 'green',
      available: false
    },
    {
      name: 'Basil',
      status: 'planned',
      description: 'Coming soon - Fresh herb cultivation',
      color: 'lime',
      available: false
    },
    {
      name: 'Mint',
      status: 'planned',
      description: 'Coming soon - Aromatic mint varieties',
      color: 'green',
      available: false
    },
    {
      name: 'Cilantro',
      status: 'planned',
      description: 'Coming soon - Coriander growing tips',
      color: 'emerald',
      available: false
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'}`}>
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dark Mode Toggle */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-full transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } shadow-lg`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-800"></div>
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Leaf className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Greens</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Leafy vegetables and fresh herbs cultivated using hydroponic systems.
              Track growth, optimize nutrients, and harvest fresh greens year-round.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-100 rounded-full text-yellow-800 text-lg font-medium mb-6">
              <Sprout className="w-5 h-5 mr-2" />
              Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Greens Category Under Development
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re preparing detailed growing guides and tracking systems for these leafy greens.
              Check back soon for live plant monitoring and cultivation data!
            </p>
          </div>

          {/* Planned Plants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {greens.map((green) => (
              <div
                key={green.name}
                className="bg-white/60 border-2 border-gray-300 rounded-xl p-6 opacity-75"
              >
                <div className="flex items-center justify-between mb-4">
                  <Leaf className="w-12 h-12 text-gray-400" />
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                    {green.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{green.name}</h3>
                <p className="text-gray-600 mb-4">{green.description}</p>
                <div className="bg-gray-400 cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 inline-flex items-center justify-center w-full">
                  Coming Soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-green-600 hover:text-green-600 transition-all duration-200"
          >
            ← Back to Categories
          </Link>
        </div>
      </section>
    </div>
  );
}

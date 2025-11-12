'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight, Sun } from 'lucide-react';

export default function PlantsPage() {
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
  const plants = [
    {
      name: 'Microgreens',
      status: 'planned',
      description: 'Coming soon - Fast-growing microgreens',
      color: 'emerald',
      available: false
    },
    {
      name: 'Seedlings',
      status: 'planned',
      description: 'Coming soon - Seedling propagation guide',
      color: 'green',
      available: false
    },
    {
      name: 'Indoor Plants',
      status: 'planned',
      description: 'Coming soon - Indoor plant cultivation',
      color: 'teal',
      available: false
    },
    {
      name: 'Succulents',
      status: 'planned',
      description: 'Coming soon - Succulent care guide',
      color: 'lime',
      available: false
    },
    {
      name: 'Ferns',
      status: 'planned',
      description: 'Coming soon - Fern growing tips',
      color: 'green',
      available: false
    },
    {
      name: 'Pothos',
      status: 'planned',
      description: 'Coming soon - Popular houseplant care',
      color: 'emerald',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Sprout className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Plants</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              General plants, seedlings, and indoor varieties cultivated hydroponically.
              Explore propagation techniques, growth tracking, and care guides.
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
              Plants Category Under Development
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re developing detailed care guides and tracking systems for these plant varieties.
              Check back soon for live monitoring and cultivation resources!
            </p>
          </div>

          {/* Planned Plants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plants.map((plant) => (
              <div
                key={plant.name}
                className="bg-white/60 border-2 border-gray-300 rounded-xl p-6 opacity-75"
              >
                <div className="flex items-center justify-between mb-4">
                  <Sprout className="w-12 h-12 text-gray-400" />
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                    {plant.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{plant.name}</h3>
                <p className="text-gray-600 mb-4">{plant.description}</p>
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
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-emerald-600 hover:text-emerald-600 transition-all duration-200"
          >
            ← Back to Categories
          </Link>
        </div>
      </section>
    </div>
  );
}

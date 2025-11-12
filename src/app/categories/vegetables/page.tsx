'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Carrot, ArrowRight, Sprout, Sun } from 'lucide-react';

export default function VegetablesPage() {
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
  const vegetables = [
    {
      name: 'Tomato',
      status: 'planned',
      description: 'Coming soon - Fresh tomato varieties',
      color: 'red',
      available: false
    },
    {
      name: 'Pepper',
      status: 'planned',
      description: 'Coming soon - Sweet and hot peppers',
      color: 'orange',
      available: false
    },
    {
      name: 'Cucumber',
      status: 'planned',
      description: 'Coming soon - Crisp cucumber cultivation',
      color: 'green',
      available: false
    },
    {
      name: 'Carrot',
      status: 'planned',
      description: 'Coming soon - Root vegetable growing guide',
      color: 'orange',
      available: false
    },
    {
      name: 'Radish',
      status: 'planned',
      description: 'Coming soon - Quick-growing radish varieties',
      color: 'red',
      available: false
    },
    {
      name: 'Eggplant',
      status: 'planned',
      description: 'Coming soon - Eggplant cultivation tips',
      color: 'purple',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Carrot className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Vegetables</h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Fruiting and root vegetables grown using advanced hydroponic techniques.
              Monitor growth stages, optimize yields, and harvest fresh produce.
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
              Vegetables Category Under Development
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re preparing comprehensive growing guides and monitoring systems for these vegetables.
              Check back soon for live plant tracking and cultivation insights!
            </p>
          </div>

          {/* Planned Plants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vegetables.map((vegetable) => (
              <div
                key={vegetable.name}
                className="bg-white/60 border-2 border-gray-300 rounded-xl p-6 opacity-75"
              >
                <div className="flex items-center justify-between mb-4">
                  <Carrot className="w-12 h-12 text-gray-400" />
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                    {vegetable.status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">{vegetable.name}</h3>
                <p className="text-gray-600 mb-4">{vegetable.description}</p>
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
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:border-orange-600 hover:text-orange-600 transition-all duration-200"
          >
            ← Back to Categories
          </Link>
        </div>
      </section>
    </div>
  );
}

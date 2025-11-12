'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlowerIcon, ArrowRight, Sprout, Sun } from 'lucide-react';

export default function FlowersPage() {
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
  const flowers = [
    {
      name: 'Rose',
      status: 'growing',
      description: 'Currently growing and tracking rose plant progress',
      href: '/rose-plant',
      color: 'rose',
      available: true
    },
    {
      name: 'Hibiscus',
      status: 'growing',
      description: 'Currently growing and tracking hibiscus plant progress',
      href: '/hibiscus-plant',
      color: 'pink',
      available: true
    },
    {
      name: 'Marigold',
      status: 'planned',
      description: 'Coming soon - Marigold cultivation guide',
      href: '#',
      color: 'yellow',
      available: false
    },
    {
      name: 'Sunflower',
      status: 'planned',
      description: 'Coming soon - Sunflower growing tips',
      href: '#',
      color: 'orange',
      available: false
    },
    {
      name: 'Tulip',
      status: 'planned',
      description: 'Coming soon - Tulip planting guide',
      href: '#',
      color: 'purple',
      available: false
    },
    {
      name: 'Orchid',
      status: 'planned',
      description: 'Coming soon - Orchid care instructions',
      href: '#',
      color: 'indigo',
      available: false
    }
  ];

  const getColorClasses = (color: string, available: boolean) => {
    if (!available) {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        icon: 'text-gray-400',
        text: 'text-gray-600',
        button: 'bg-gray-400 cursor-not-allowed'
      };
    }

    const colors: Record<string, any> = {
      rose: {
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        icon: 'text-rose-600',
        text: 'text-rose-900',
        button: 'bg-rose-600 hover:bg-rose-700'
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-300',
        icon: 'text-pink-600',
        text: 'text-pink-900',
        button: 'bg-pink-600 hover:bg-pink-700'
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        icon: 'text-yellow-600',
        text: 'text-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        icon: 'text-orange-600',
        text: 'text-orange-900',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        icon: 'text-purple-600',
        text: 'text-purple-900',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-300',
        icon: 'text-indigo-600',
        text: 'text-indigo-900',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      }
    };
    return colors[color];
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100'}`}>
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600 relative">
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
              <FlowerIcon className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Flowers</h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              Explore our beautiful collection of ornamental and decorative flowers.
              Track growth, monitor health, and learn cultivation techniques.
            </p>
          </div>
        </div>
      </section>

      {/* Flowers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Growing Plants */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Sprout className="w-6 h-6 text-green-600 mr-2" />
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Currently Growing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {flowers.filter(f => f.available).map((flower) => {
                const colors = getColorClasses(flower.color, flower.available);
                return (
                  <Link
                    key={flower.name}
                    href={flower.href}
                    className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <FlowerIcon className={`w-12 h-12 ${colors.icon}`} />
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {flower.status}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>{flower.name}</h3>
                    <p className="text-gray-600 mb-4">{flower.description}</p>
                    <div className={`${colors.button} text-white font-medium rounded-lg px-4 py-2 inline-flex items-center justify-center w-full transition-colors duration-200`}>
                      View Plant Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Planned Plants */}
          <div>
            <div className="flex items-center mb-6">
              <FlowerIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`} />
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {flowers.filter(f => !f.available).map((flower) => {
                const colors = getColorClasses(flower.color, flower.available);
                return (
                  <div
                    key={flower.name}
                    className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 opacity-60`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <FlowerIcon className={`w-12 h-12 ${colors.icon}`} />
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                        {flower.status}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>{flower.name}</h3>
                    <p className="text-gray-600 mb-4">{flower.description}</p>
                    <div className={`${colors.button} text-white font-medium rounded-lg px-4 py-2 inline-flex items-center justify-center w-full`}>
                      Coming Soon
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Back Navigation */}
      <section className={`py-8 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/categories"
            className={`inline-flex items-center px-6 py-3 border-2 ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg font-medium hover:border-pink-600 hover:text-pink-600 transition-all duration-200`}
          >
            ← Back to Categories
          </Link>
        </div>
      </section>
    </div>
  );
}

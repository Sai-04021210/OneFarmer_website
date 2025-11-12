'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Leaf, FlowerIcon, Carrot, Sprout, ArrowRight, Sun } from 'lucide-react';

export default function CategoriesPage() {
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
  const categories = [
    {
      name: 'Greens',
      icon: Leaf,
      color: 'green',
      description: 'Leafy vegetables and herbs',
      plants: [
        { name: 'Lettuce', status: 'planned', href: null },
        { name: 'Spinach', status: 'planned', href: null },
        { name: 'Kale', status: 'planned', href: null },
        { name: 'Basil', status: 'planned', href: null },
        { name: 'Mint', status: 'planned', href: null },
        { name: 'Cilantro', status: 'planned', href: null }
      ],
      href: '/categories/greens'
    },
    {
      name: 'Flowers',
      icon: FlowerIcon,
      color: 'pink',
      description: 'Ornamental and decorative plants',
      plants: [
        { name: 'Rose', status: 'growing', href: '/rose-plant' },
        { name: 'Hibiscus', status: 'growing', href: '/hibiscus-plant' },
        { name: 'Marigold', status: 'planned', href: null },
        { name: 'Sunflower', status: 'planned', href: null },
        { name: 'Tulip', status: 'planned', href: null },
        { name: 'Orchid', status: 'planned', href: null }
      ],
      href: '/categories/flowers'
    },
    {
      name: 'Vegetables',
      icon: Carrot,
      color: 'orange',
      description: 'Fruiting and root vegetables',
      plants: [
        { name: 'Tomato', status: 'planned', href: null },
        { name: 'Pepper', status: 'planned', href: null },
        { name: 'Cucumber', status: 'planned', href: null },
        { name: 'Carrot', status: 'planned', href: null },
        { name: 'Radish', status: 'planned', href: null },
        { name: 'Eggplant', status: 'planned', href: null }
      ],
      href: '/categories/vegetables'
    },
    {
      name: 'Plants',
      icon: Sprout,
      color: 'emerald',
      description: 'General plants and seedlings',
      plants: [
        { name: 'Microgreens', status: 'planned', href: null },
        { name: 'Seedlings', status: 'planned', href: null },
        { name: 'Indoor Plants', status: 'planned', href: null },
        { name: 'Succulents', status: 'planned', href: null },
        { name: 'Ferns', status: 'planned', href: null },
        { name: 'Pothos', status: 'planned', href: null }
      ],
      href: '/categories/plants'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      green: {
        bg: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
        border: isDarkMode ? 'border-green-400/30' : 'border-green-200',
        icon: 'text-green-600',
        hover: isDarkMode ? 'hover:border-green-400' : 'hover:border-green-400',
        button: 'bg-green-600 hover:bg-green-700',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600'
      },
      pink: {
        bg: isDarkMode ? 'bg-pink-900/20' : 'bg-pink-50',
        border: isDarkMode ? 'border-pink-400/30' : 'border-pink-200',
        icon: 'text-pink-600',
        hover: isDarkMode ? 'hover:border-pink-400' : 'hover:border-pink-400',
        button: 'bg-pink-600 hover:bg-pink-700',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
        border: isDarkMode ? 'border-orange-400/30' : 'border-orange-200',
        icon: 'text-orange-600',
        hover: isDarkMode ? 'hover:border-orange-400' : 'hover:border-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600'
      },
      emerald: {
        bg: isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
        border: isDarkMode ? 'border-emerald-400/30' : 'border-emerald-200',
        icon: 'text-emerald-600',
        hover: isDarkMode ? 'hover:border-emerald-400' : 'hover:border-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }
    };
    return colors[color];
  };

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
            <h1 className="text-5xl font-bold text-white mb-4">
              Plant Categories
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Explore our organized collection of plants categorized by type.
              Navigate easily through greens, flowers, vegetables, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const colors = getColorClasses(category.color);

              return (
                <div
                  key={category.name}
                  className={`${colors.bg} ${colors.border} border-2 ${colors.hover} rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
                >
                  {/* Category Header */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                      <Icon className={`w-10 h-10 ${colors.icon}`} />
                    </div>
                    <div>
                      <h2 className={`text-3xl font-bold ${colors.text}`}>{category.name}</h2>
                      <p className={colors.subtext}>{category.description}</p>
                    </div>
                  </div>

                  {/* Plants List */}
                  <div className="mb-6">
                    <h3 className={`text-sm font-semibold ${colors.subtext} mb-3 uppercase tracking-wide`}>
                      Popular Plants
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {category.plants.map((plant) => {
                        const content = (
                          <>
                            <span>• {plant.name}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              plant.status === 'growing'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {plant.status}
                            </span>
                          </>
                        );

                        const baseClassName = `${isDarkMode ? 'bg-gray-800/60' : 'bg-white/60'} rounded-lg px-3 py-2 text-sm ${colors.text} font-medium flex items-center justify-between`;

                        return plant.href ? (
                          <Link
                            key={plant.name}
                            href={plant.href}
                            className={`${baseClassName} hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer`}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div
                            key={plant.name}
                            className={baseClassName}
                          >
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Button */}
                  <Link
                    href={category.href}
                    className={`${colors.button} text-white font-medium rounded-lg px-6 py-3 inline-flex items-center justify-center w-full transition-colors duration-200 shadow-lg`}
                  >
                    Explore {category.name}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className={`py-12 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Quick Navigation</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`inline-flex items-center px-6 py-3 border-2 ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg font-medium hover:border-green-600 hover:text-green-600 transition-all duration-200`}
                >
                  {category.name}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

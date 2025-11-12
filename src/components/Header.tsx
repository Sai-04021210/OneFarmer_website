'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, X, BookOpen, Mail, Sprout, ChevronDown, Leaf, FlowerIcon, Carrot, LogIn, LogOut } from 'lucide-react';

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Sprout },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const categories = [
    { name: 'Greens', href: '/categories/greens', icon: Leaf },
    { name: 'Flowers', href: '/categories/flowers', icon: FlowerIcon, hasDropdown: true },
    { name: 'Vegetables', href: '/categories/vegetables', icon: Carrot },
    { name: 'Plants', href: '/categories/plants', icon: Sprout },
  ];

  const flowerPlants = [
    { name: 'Rose', href: '/rose-plant', growing: true },
    { name: 'Hibiscus', href: '/hibiscus-plant', growing: true },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">#OneFarmer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <Link
                href="/categories"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <BookOpen className="w-4 h-4" />
                <span>Categories</span>
                <ChevronDown className="w-4 h-4" />
              </Link>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {session?.user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <span>Admin</span>
                    </Link>
                  )}
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{session.user?.name}</span> ({session.user?.role})
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Categories */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Categories
                </div>
                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Admin</span>
                  </Link>
                )}
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Auth buttons */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import Link from 'next/link';
import { Github, Linkedin, Mail, Phone, MapPin, Sprout } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">OneFarmer</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              A personal journey demonstrating that sustainable urban farming is achievable for everyone.
              Through hydroponics and modern technology, we prove that one farmer from each house - even in
              urban areas - is possible. Join the movement towards self-sufficient, sustainable living.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Sai-04021210"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/makkapati-sai-ram/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:sairammakkapati@outlook.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Plant Categories
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Blog & Updates
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">sairammakkapati@outlook.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+49 15783221171</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Saarbrücken, Germany</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} OneFarmer. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Making sustainable urban farming accessible to everyone
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

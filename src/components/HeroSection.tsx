import Link from 'next/link';
import { ArrowRight, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

const HeroSection = () => {
  const [content, setContent] = useState({ location: '', title: '', subtitle: '' });

  useEffect(() => {
    const fetchContent = async () => {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data.hero);
    };
    fetchContent();
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{content.location}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.title) }}></h1>
              <p className="text-xl text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.subtitle) }}></p>
            </div>

            {/* Key Skills */}
            <div className="flex flex-wrap gap-2">
              {['MQTT', 'OPC UA', 'Eclipse BaSyx', 'Node-RED', 'Python', 'Docker', 'Industry 4.0'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View My Projects
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Get In Touch
                <Mail className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 pt-4">
              <span className="text-gray-600 text-sm">Connect with me:</span>
              <div className="flex space-x-3">
                <a
                  href="https://github.com/Sai-04021210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/makkapati-sai-ram/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="mailto:sairammakkapati@outlook.com"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Stats */}
          <div className="space-y-8">
            {/* Professional Stats */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Highlights</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">3+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">30+</div>
                  <div className="text-sm text-gray-600">Machine Signals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">&lt;250ms</div>
                  <div className="text-sm text-gray-600">End-to-End Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">60+</div>
                  <div className="text-sm text-gray-600">IoT Prototypes</div>
                </div>
              </div>
            </div>

            {/* Current Role */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-2">Currently at</h3>
              <div className="text-2xl font-bold mb-2">Fraunhofer IGCV</div>
              <p className="text-blue-100">
                Student Research Assistant working on Industrial Digital Twins 
                and containerized data-twin pipelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

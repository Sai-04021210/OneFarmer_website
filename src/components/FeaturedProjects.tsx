import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

const FeaturedProjects = () => {
  const projects = [
    {
      title: 'Smart Farming Weather Data Marketplace',
      description: 'Decentralized platform enabling farmers to monetize weather station data through micropayments to insurance companies, AgTech consultants, and AI models.',
      technologies: ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'Blockchain'],
      period: '2025-01',
      role: 'Full-Stack Developer',
      highlights: ['Micropayment integration', 'Multi-station API support', 'Data quality assurance'],
      category: 'AgTech'
    },
    {
      title: 'Smart-Grid Digital Twin Platform',
      description: 'End-to-end stack (BaSyx AAS, FastAPI, LSTM) that ingests live meter data, predicts 24-h load with ≈ 5% MAPE, and serves React/Node-RED dashboards.',
      technologies: ['Eclipse BaSyx', 'FastAPI', 'LSTM', 'React', 'Node-RED'],
      period: '2024-02 - 2024-06',
      role: 'Solution Architect',
      highlights: ['5% MAPE prediction accuracy', '24-hour load forecasting', 'Real-time data ingestion'],
      category: 'Digital Twin'
    },
    {
      title: 'Containerized Data-Twin Pipeline',
      description: 'Docker-Compose stack ingesting multi-protocol shop-floor streams (MQTT, OPC UA, REST, CSV) at <250ms end-to-end latency with complete time-series persistence.',
      technologies: ['Docker', 'Eclipse BaSyx', 'Python', 'Node-RED', 'InfluxDB'],
      period: '2024-08 - Present',
      role: 'Research Assistant',
      highlights: ['<250ms latency', 'Multi-protocol support', 'Time-series data persistence'],
      category: 'Industrial IoT'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AgTech':
        return 'bg-emerald-100 text-emerald-800';
      case 'Digital Twin':
        return 'bg-blue-100 text-blue-800';
      case 'Industrial IoT':
        return 'bg-green-100 text-green-800';
      case 'IoT Solutions':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Showcasing real-world Industrial IoT and Digital Twin solutions 
            that deliver measurable impact in production environments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(project.category)}`}>
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                {/* Role and Period */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{project.period}</span>
                  <span className="font-medium">{project.role}</span>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Achievements:</h4>
                  <ul className="space-y-1">
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects CTA */}
        <div className="text-center">
          <Link
            href="/projects"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View All Projects
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;

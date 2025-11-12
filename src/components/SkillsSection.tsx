import {
  Code,
  Cpu,
  Network,
  Container,
  Settings,
  BarChart3
} from 'lucide-react';

const SkillsSection = () => {
  const skillCategories = [
    {
      title: 'Programming & Scripting',
      icon: Code,
      skills: ['Python', 'C/C++', 'TypeScript/Node.js', 'JavaScript'],
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'IoT Protocols & Standards',
      icon: Network,
      skills: ['MQTT', 'OPC UA', 'REST/JSON-RPC', 'Modbus'],
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Digital Twin & Industry 4.0',
      icon: Cpu,
      skills: ['Eclipse BaSyx', 'Asset Administration Shell (AAS)', 'IDTA Sub-models', 'P&P'],
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Data & Machine Learning',
      icon: BarChart3,
      skills: ['PostgreSQL', 'InfluxDB (time-series)', 'Scikit-learn', 'ML inference'],
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Frameworks & Tools',
      icon: Settings,
      skills: ['Node-RED', 'FastAPI', 'React', 'Odoo', 'GoJS'],
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'DevOps & Operations',
      icon: Container,
      skills: ['Docker & Compose', 'GitLab CI/CD', 'Linux', 'Grafana'],
      color: 'bg-red-50 text-red-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Technical Expertise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive skill set spanning from edge devices to cloud infrastructure, 
            enabling end-to-end Industrial IoT and Digital Twin solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${category.color} mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="flex items-center text-gray-700"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Experience Highlights */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">Fraunhofer IGCV</div>
              <div className="text-gray-300">Student Research Assistant</div>
              <div className="text-sm text-gray-400 mt-1">2024 - Present</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">ZeMA</div>
              <div className="text-gray-300">Research Assistant (HiWi)</div>
              <div className="text-sm text-gray-400 mt-1">2023 - Present</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">TechCiti</div>
              <div className="text-gray-300">IoT Lab Mentor</div>
              <div className="text-sm text-gray-400 mt-1">2020 - 2022</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;

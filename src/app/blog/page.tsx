import { Calendar, Clock, BookOpen } from 'lucide-react';

export default function Blog() {
  // Sample blog posts - in a real implementation, these would come from a CMS or markdown files
  const blogPosts = [
    {
      title: 'Getting Started with Eclipse BaSyx for Digital Twins',
      excerpt: 'A comprehensive guide to setting up Eclipse BaSyx AAS server and creating your first Asset Administration Shell for Industry 4.0 applications.',
      date: '2024-01-15',
      readTime: '8 min read',
      category: 'Digital Twin',
      tags: ['Eclipse BaSyx', 'AAS', 'Industry 4.0', 'Tutorial'],
      slug: 'getting-started-eclipse-basyx',
      featured: true
    },
    {
      title: 'MQTT vs OPC UA: Choosing the Right Protocol for Industrial IoT',
      excerpt: 'Deep dive comparison of MQTT and OPC UA protocols, their use cases, performance characteristics, and when to use each in industrial applications.',
      date: '2024-01-10',
      readTime: '12 min read',
      category: 'Industrial IoT',
      tags: ['MQTT', 'OPC UA', 'Protocols', 'Comparison'],
      slug: 'mqtt-vs-opc-ua-comparison',
      featured: false
    },
    {
      title: 'Building Containerized IoT Data Pipelines with Docker',
      excerpt: 'Step-by-step tutorial on creating scalable, containerized data pipelines for IoT applications using Docker Compose and microservices architecture.',
      date: '2024-01-05',
      readTime: '15 min read',
      category: 'DevOps',
      tags: ['Docker', 'Containers', 'IoT', 'Microservices'],
      slug: 'containerized-iot-data-pipelines',
      featured: false
    },
    {
      title: 'Node-RED for Industrial Automation: Best Practices',
      excerpt: 'Learn how to effectively use Node-RED for industrial automation projects, including security considerations, performance optimization, and deployment strategies.',
      date: '2023-12-28',
      readTime: '10 min read',
      category: 'Automation',
      tags: ['Node-RED', 'Automation', 'Best Practices', 'Security'],
      slug: 'node-red-industrial-automation',
      featured: false
    },
    {
      title: 'Time-Series Data Management with InfluxDB for IoT',
      excerpt: 'Complete guide to using InfluxDB for IoT time-series data storage, including schema design, query optimization, and retention policies.',
      date: '2023-12-20',
      readTime: '11 min read',
      category: 'Data Management',
      tags: ['InfluxDB', 'Time-series', 'IoT', 'Database'],
      slug: 'influxdb-iot-time-series',
      featured: false
    },
    {
      title: 'Machine Learning for Predictive Maintenance in Industry 4.0',
      excerpt: 'Implementing ML models for predictive maintenance using Python, scikit-learn, and real-world industrial sensor data.',
      date: '2023-12-15',
      readTime: '14 min read',
      category: 'Machine Learning',
      tags: ['ML', 'Predictive Maintenance', 'Python', 'Scikit-learn'],
      slug: 'ml-predictive-maintenance',
      featured: false
    }
  ];



  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Digital Twin':
        return 'bg-blue-100 text-blue-800';
      case 'Industrial IoT':
        return 'bg-green-100 text-green-800';
      case 'DevOps':
        return 'bg-purple-100 text-purple-800';
      case 'Automation':
        return 'bg-orange-100 text-orange-800';
      case 'Data Management':
        return 'bg-red-100 text-red-800';
      case 'Machine Learning':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Blog & Tutorials
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Insights, tutorials, and deep dives into Industrial IoT, Digital Twins, 
              and automation technologies. Learn from real-world implementations and best practices.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(featuredPost.category)}`}>
                    {featuredPost.category}
                  </span>
                  <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    Featured
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h3>
                
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="mr-4">{new Date(featuredPost.date).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-blue-800 font-medium">Coming Soon</p>
                      <p className="text-xs text-blue-600">Blog posts will be available soon</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span className="mr-3">{new Date(post.date).toLocaleDateString()}</span>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get notified when new tutorials and insights are published. 
            Join the community of Industrial IoT and Digital Twin enthusiasts.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800 font-medium">Newsletter Coming Soon</p>
            <p className="text-xs text-blue-600">Subscribe feature will be available soon</p>
          </div>
        </section>
      </div>
    </div>
  );
}

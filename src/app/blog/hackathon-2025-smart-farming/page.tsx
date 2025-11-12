import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart Farming Hackathon 2025: Building a Micro Weather Data Marketplace',
  description: 'Our team\'s journey developing a decentralized weather data trading platform for farmers at the Smart Farming Hackathon 2025, tackling Use Case 3 - Monetization of Weather Data.',
}

export default function HackathonSmartFarming2025() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <header className="p-8 bg-green-600 text-white">
            <h1 className="text-4xl font-bold mb-4">
              Smart Farming Hackathon 2025: Building a Micro Weather Data Marketplace
            </h1>
            <p className="text-xl text-green-100">
              Developing a decentralized platform for weather data monetization in agriculture
            </p>
            <div className="mt-4 text-sm text-green-200">
              <time>January 2025</time> • Hackathon Project • Use Case 3
            </div>
          </header>

            <div className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                The Challenge: Weather Data as Currency
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                At the Smart Farming Hackathon 2025, our team tackled Use Case 3: &ldquo;Monetization of own weather data&rdquo;
                (Monetarisierung eigener Wetterdaten). The challenge was to create a decentralized platform where 
                farmers could automatically provide regional weather data and market it to data-based services 
                like insurance companies, consultants, and AI models through micropayments.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The core problem we addressed: while regional weather data is crucial for agricultural decisions, 
                insurance models, and risk analyses, many areas lack precise measuring points. Meanwhile, thousands 
                of private weather stations on farms remain untapped due to lack of technical and monetary incentives.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Solution: Micro Weather Marketplace
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Key Features
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>API Integration:</strong> Connected weather stations (Netatmo, Pessl, Davis) via REST API</li>
                  <li><strong>Data Quality Assurance:</strong> Implemented quality checks and data categorization by location, parameters, and reliability</li>
                  <li><strong>Micropayment System:</strong> Enabled fair compensation for farmers through blockchain-based micropayments</li>
                  <li><strong>Custom Data Packages:</strong> Location-based, real-time, and historical data offerings</li>
                  <li><strong>Trust Scores:</strong> Transparent logging with data source display and reliability metrics</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Technical Architecture
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-200">
                    Data Sources
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Temperature, precipitation, soil moisture</li>
                    <li>• Humidity, wind measurements</li>
                    <li>• Real-time vineyard monitoring data</li>
                    <li>• DLR weather station integration</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-200">
                    Tech Stack
                  </h3>
                  <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                    <li>• Node.js & Python backend</li>
                    <li>• PostgreSQL database</li>
                    <li>• REST API (JSON/CSV interfaces)</li>
                    <li>• Leaflet.js mapping</li>
                    <li>• Blockchain micropayments</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Ecosystem
              </h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Farmers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data providers with weather stations</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Companies</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Insurance, AgTech, consultants</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Developers</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Platform operators, data infrastructure</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Real-World Data Integration
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our solution worked with actual vineyard monitoring data, including temperature, humidity, 
                and dew point measurements from multiple weather stations. We processed CSV data from 
                experimental vineyards and integrated DLR weather station networks, demonstrating real-world 
                applicability of our platform.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Data Sources Integrated:</strong> L_55_Unten, L_77_Mitte vineyard stations, 
                  VitiMeteo forecasting models, and DLR weather station networks
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Impact & Future Vision
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our micro weather marketplace addresses the growing demand for high-resolution, local weather data 
                essential for climate models, yield simulation, and plant disease forecasts. By creating monetary 
                incentives for data sharing, we&rsquo;re building toward a federated data economy in rural areas.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-200">
                  Success Factors
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• <strong>Fairness:</strong> Equitable compensation for farmers</li>
                    <li>• <strong>Trust:</strong> Transparent data quality metrics</li>
                  </ul>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• <strong>Market Potential:</strong> Integration with existing platforms</li>
                    <li>• <strong>Sustainability:</strong> Long-term data availability model</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Team & Collaboration
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                This hackathon project brought together expertise across technology, law, agronomy, and business 
                administration. Working with mentors Leonard Pfahl and Heiner Denzer, we developed an 
                interdisciplinary solution that balances technical innovation with practical agricultural needs.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                The platform design enables connection to existing systems like DWD (German Weather Service), 
                Dataland, and INSPIRE, ensuring scalability and integration with current agricultural data infrastructure.
              </p>
            </section>

            <footer className="border-t border-gray-200 dark:border-gray-600 pt-6 mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This project was developed during the Smart Farming Hackathon 2025, focusing on innovative 
                solutions for sustainable agriculture through data monetization and farmer empowerment.
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  )
}
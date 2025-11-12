# RamHomeLabs - Industrial IoT & Digital Twin Portfolio

A professional portfolio website showcasing Industrial IoT and Digital Twin solutions by Sai Ram Makkapati, featuring live IoT data streaming with the OneFarmer hydroponics monitoring system.

## 🚀 Features

- **Modern Design**: Built with Next.js 15 and Tailwind CSS 4
- **Responsive**: Mobile-first design that works on all devices
- **Professional Portfolio**: Showcases projects, experience, and skills
- **OneFarmer IoT**: Live MQTT data streaming from ESP8266 sensors
- **Real-time Dashboard**: Parameter validation and data export functionality
- **Blog Ready**: Technical articles and hackathon experiences
- **SEO Optimized**: Meta tags and structured data for better search visibility
- **Performance**: Optimized with Turbopack for fast loading

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **IoT**: MQTT.js for real-time sensor data
- **Content**: MDX for blog posts
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## ⚡ Quick Start (One Command Setup)

For a completely fresh machine, run these commands:

```bash
# Clone the repository
git clone https://github.com/your-username/My_Website.git
cd My_Website

# Install dependencies and start development server
npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js**: >= 18.17.0 (Recommended: 20.x LTS)
- **npm**: >= 9.0.0
- **Git**: Latest version
- **Modern browser**: Chrome, Firefox, Safari, or Edge

Check your versions:
```bash
node --version  # Should be >= 18.17.0
npm --version   # Should be >= 9.0.0
git --version   # Any recent version
```

## 🚀 Detailed Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/My_Website.git
cd My_Website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
My_Website/
├── src/
│   ├── app/
│   │   ├── about/                    # About page
│   │   ├── blog/                     # Blog articles
│   │   │   └── hackathon-2025-smart-farming/
│   │   ├── contact/                  # Contact page
│   │   ├── nerd-projects/            # Technical projects showcase
│   │   ├── onefarmer/                # IoT hydroponics dashboard
│   │   ├── api/
│   │   │   ├── mqtt-data/            # MQTT API endpoint
│   │   │   └── export-data/          # Data export API
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   └── components/
│       ├── Header.tsx                # Navigation header
│       ├── Footer.tsx                # Site footer
│       ├── HeroSection.tsx           # Landing hero
│       ├── MQTTDashboard.tsx         # IoT dashboard component
│       └── SkillsSection.tsx
├── public/                           # Static assets
├── REQUIREMENTS.md                   # System requirements
└── package.json                      # Dependencies
```

## 🌟 Key Features Explained

### OneFarmer IoT Dashboard
- **Real-time Data**: Live MQTT streaming from ESP8266 sensors
- **Parameter Monitoring**: Temperature, humidity, light, pH, EC, water temperature
- **Status Validation**: Optimal/acceptable/critical range indicators for rose plants
- **Data Export**: Historical data export in CSV and JSON formats
- **Location**: Germany-based hydroponic research setup

### Professional Portfolio
- **Nerd Projects**: Technical project showcase with filtering
- **About**: Professional experience timeline
- **Blog**: Technical articles and hackathon experiences
- **Contact**: Professional contact information

## 🔧 Available Scripts

```bash
# Development server with Turbopack (faster builds)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code for errors
npm run lint
```

## ⚙️ System Service Management

The website can run as a systemd service that automatically starts on boot and restarts on failure:

```bash
# Service management commands
sudo systemctl stop ramhomelabs     # Stop the service
sudo systemctl start ramhomelabs    # Start the service
sudo systemctl restart ramhomelabs  # Restart the service
sudo systemctl status ramhomelabs   # Check service status
sudo journalctl -u ramhomelabs -f   # View service logs in real-time

# Service runs on port 3003
# Local: http://localhost:3003
# Network: http://192.168.0.8:3003
```

**Service Features:**
- ✅ Auto-starts on system boot
- ✅ Auto-restarts on crash
- ✅ Runs in production mode
- ✅ Managed by systemd

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically (zero configuration)

```bash
# Optional: Deploy via Vercel CLI
npx vercel
```

### Netlify
1. Build the project:
```bash
npm run build
```
2. Deploy the `.next` folder to [Netlify](https://netlify.com)

### Manual Deployment
```bash
# Build for production
npm run build

# The output will be in the .next folder
# Upload this folder to your hosting provider
```

## 🔌 IoT Configuration

The OneFarmer system connects to an MQTT broker for live sensor data:

- **Broker**: `mqtt://192.168.0.61:1883`
- **Topics**:
  - `hydroponic/sensors/rose/temperature`
  - `hydroponic/sensors/rose/humidity`
  - `hydroponic/sensors/rose/light`
  - `hydroponic/sensors/rose/ph`
  - `hydroponic/sensors/rose/ec`
  - `hydroponic/sensors/rose/water_temp`

For production, update the broker URL in `src/app/api/mqtt-data/route.ts`

## 🎨 Customization

### Update Content
- **Personal Info**: Edit `src/app/page.tsx` and `src/components/HeroSection.tsx`
- **Projects**: Modify `src/app/nerd-projects/page.tsx`
- **About**: Update `src/app/about/page.tsx`
- **Contact**: Edit `src/app/contact/page.tsx`

### Styling
- **Colors**: Modify Tailwind classes throughout components
- **Layout**: Update `src/app/layout.tsx`
- **Fonts**: Change in `src/app/globals.css`

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### MQTT Connection Issues
- Ensure MQTT broker is running and accessible
- Check network connectivity to broker IP
- Update broker URL in API route if needed

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors
```bash
# Run type checking
npx tsc --noEmit

# Check lint issues
npm run lint
```

## 📊 Performance

- **Build Time**: ~30 seconds (with Turbopack)
- **Bundle Size**: ~500KB gzipped
- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for excellent UX

## 📧 Contact & Support

**Sai Ram Makkapati**
- Email: sairammakkapati@outlook.com
- Phone: +49 15783221171
- LinkedIn: [makkapati-sai-ram](https://www.linkedin.com/in/makkapati-sai-ram/)
- GitHub: [Sai-04021210](https://github.com/Sai-04021210)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Quick Commands Summary:**
```bash
# Complete setup from scratch
git clone <repo-url> && cd My_Website && npm install && npm run dev

# Daily development
npm run dev

# Production deployment
npm run build && npm start
```
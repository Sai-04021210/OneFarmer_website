# System Requirements

## Prerequisites

### Node.js & npm
- **Node.js**: >= 18.17.0 (Recommended: 20.x LTS or higher)
- **npm**: >= 9.0.0 (comes with Node.js)

### System Dependencies
- Git (for cloning and version control)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## Package Dependencies

This project uses the following key dependencies (automatically installed with `npm install`):

### Core Framework
- **Next.js**: 15.5.0 (React framework with App Router)
- **React**: 19.1.0
- **React DOM**: 19.1.0
- **TypeScript**: ^5

### Styling & UI
- **Tailwind CSS**: ^4
- **Lucide React**: ^0.541.0 (Icon library)
- **Framer Motion**: ^12.23.12 (Animations)

### IoT & Data
- **MQTT**: ^5.10.1 (For OneFarmer IoT data streaming)

### Content & Documentation
- **MDX**: ^3.1.0 (Markdown with JSX)
- **Next Themes**: ^0.4.6 (Dark mode support)

### Development Tools
- **ESLint**: ^9 (Code linting)
- **TypeScript**: ^5 (Type checking)

## Environment Variables (Optional)

Currently, no environment variables are required for basic functionality. The MQTT broker connection is hardcoded for development.

For production deployment, you may want to create a `.env.local` file:

```env
# MQTT Configuration (if needed for production)
NEXT_PUBLIC_MQTT_BROKER_URL=mqtt://your-broker-url:1883
NEXT_PUBLIC_MQTT_CLIENT_PREFIX=your_app_prefix

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## Port Requirements

- **Development**: Port 3000 (configurable)
- **Production**: Port 80/443 (standard web ports)
- **MQTT**: Port 1883 (for IoT data streaming - OneFarmer feature)

## Browser Support

- Chrome/Chromium >= 88
- Firefox >= 87
- Safari >= 14
- Edge >= 88

## Hardware Requirements

### Minimum
- 2GB RAM
- 1GB available disk space
- Dual-core processor

### Recommended
- 4GB RAM
- 2GB available disk space
- Quad-core processor
- SSD storage for faster builds

## Network Requirements

- Internet connection for initial setup (dependency download)
- For OneFarmer IoT features: Local network access to MQTT broker (192.168.0.61:1883)
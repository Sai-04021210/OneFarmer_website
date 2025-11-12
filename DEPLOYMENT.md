# Deployment Guide

## 🚀 Quick Deployment Commands

### For a Fresh Machine

```bash
# One-line setup (recommended)
git clone <your-repo-url> && cd My_Website && chmod +x setup.sh && ./setup.sh && npm run dev

# Or step by step:
git clone <your-repo-url>
cd My_Website
chmod +x setup.sh
./setup.sh
npm run dev
```

### For Regular Development

```bash
# Pull latest changes and start
git pull origin main && npm run dev

# Or with dependency updates
git pull origin main && npm install && npm run dev
```

## 🌐 Production Deployment

### Vercel (Recommended)

1. **GitHub Integration**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "deploy: ready for production"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically (zero configuration needed)

3. **Environment Variables** (if needed)
   - Add any environment variables in Vercel dashboard
   - No environment variables required for basic functionality

### Netlify

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Drag and drop the `.next` folder to [netlify.com](https://netlify.com)
   - Or use Netlify CLI:
     ```bash
     npx netlify deploy --prod --dir=.next
     ```

### Self-Hosted Server

```bash
# On your server
git clone <your-repo-url>
cd My_Website
npm install
npm run build
npm start

# With PM2 (recommended for production)
npm install -g pm2
npm run build
pm2 start npm --name "ramhomelabs" -- start
pm2 startup
pm2 save
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Deploy:
```bash
docker build -t ramhomelabs .
docker run -p 3000:3000 ramhomelabs
```

## 🔧 Environment Configuration

### Development
No environment variables needed for development.

### Production (Optional)
Create `.env.local`:
```env
# MQTT Configuration (optional)
NEXT_PUBLIC_MQTT_BROKER_URL=mqtt://your-production-broker:1883

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Domain (optional)
NEXTAUTH_URL=https://yourdomain.com
```

## 📊 Performance Optimization

### Before Deployment
```bash
# Run linting
npm run lint

# Check build
npm run build

# Analyze bundle (optional)
npx @next/bundle-analyzer
```

### Production Checklist
- [ ] All lint errors resolved
- [ ] Build completes successfully
- [ ] MQTT broker accessible (for OneFarmer features)
- [ ] All environment variables set
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] CDN configured (optional)

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to git
- Use secure MQTT broker credentials
- Enable HTTPS in production

### MQTT Security
```javascript
// Update in src/app/api/mqtt-data/route.ts for production
const mqttClient = mqtt.connect('mqtts://your-secure-broker:8883', {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  // ... other secure options
});
```

## 🚨 Troubleshooting Deployment

### Common Issues

1. **Build Fails**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Port Issues**
   ```bash
   # Change port
   npm run dev -- -p 3001

   # Or set environment variable
   PORT=3001 npm run dev
   ```

3. **MQTT Connection in Production**
   - Update broker URL in `src/app/api/mqtt-data/route.ts`
   - Ensure firewall allows MQTT port (1883/8883)
   - Check network connectivity

4. **Vercel Deployment Issues**
   - Check Vercel function logs
   - Ensure build command is correct: `npm run build`
   - Verify Node.js version in vercel.json if needed

## 📈 Monitoring & Analytics

### Performance Monitoring
- Use Vercel Analytics (built-in)
- Google PageSpeed Insights
- Lighthouse CI

### Error Tracking
- Add Sentry for error tracking (optional)
- Use Vercel error reporting
- Monitor MQTT connection status

## 🔄 CI/CD Pipeline (Optional)

GitHub Actions example (`.github/workflows/deploy.yml`):
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

## 📞 Deployment Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in your deployment platform
3. Test locally first: `npm run build && npm start`
4. Contact: sairammakkapati@outlook.com

---

**Quick Reference:**
```bash
# Development
npm run dev

# Production build
npm run build

# Production server
npm start

# Complete deployment test
npm run build && npm start
```
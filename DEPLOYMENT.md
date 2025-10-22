# 🚀 Deployment Guide

This guide covers how to deploy GojoStreamNet to various platforms.

## 🔥 Vercel (Recommended)

Vercel is the recommended deployment platform for this project as it's optimized for React applications.

### Automatic Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository: `patheticnoob/gojoStreamNet`

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   VITE_APP_TITLE=GojoStreamNet
   VITE_HIANIME_API_URL=https://hianime-api-jzl7.onrender.com/api/v1
   VITE_YUMA_API_URL=https://yumaapi.vercel.app
   VITE_IMAGE_OPTIMIZATION_SERVICE=https://images.weserv.nl
   VITE_ENABLE_PERFORMANCE_MONITOR=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🌐 Netlify

### Via Git Integration

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Add the same environment variables as Vercel

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

## 🐳 Docker

### Build and Run Locally

```bash
# Build the image
docker build -t gojostreamnet .

# Run the container
docker run -p 3000:3000 gojostreamnet
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_APP_TITLE=GojoStreamNet
      - VITE_HIANIME_API_URL=https://hianime-api-jzl7.onrender.com/api/v1
      - VITE_YUMA_API_URL=https://yumaapi.vercel.app
```

## ☁️ Other Platforms

### GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

## 🔧 Environment Configuration

### Production Environment Variables

```env
VITE_APP_TITLE=GojoStreamNet
VITE_HIANIME_API_URL=https://hianime-api-jzl7.onrender.com/api/v1
VITE_YUMA_API_URL=https://yumaapi.vercel.app
VITE_IMAGE_OPTIMIZATION_SERVICE=https://images.weserv.nl
VITE_ENABLE_PERFORMANCE_MONITOR=false
VITE_ENABLE_DEBUG_LOGS=false
```

### Development Environment Variables

```env
VITE_APP_TITLE=GojoStreamNet (Dev)
VITE_HIANIME_API_URL=https://hianime-api-jzl7.onrender.com/api/v1
VITE_YUMA_API_URL=https://yumaapi.vercel.app
VITE_IMAGE_OPTIMIZATION_SERVICE=https://images.weserv.nl
VITE_ENABLE_PERFORMANCE_MONITOR=true
VITE_ENABLE_DEBUG_LOGS=true
```

## 📊 Performance Optimization

### Build Optimization

The project includes several optimizations:

- **Code Splitting**: Automatic vendor and route-based splitting
- **Tree Shaking**: Removes unused code
- **Minification**: ESBuild for fast minification
- **Asset Optimization**: Images and fonts are optimized
- **Caching**: Proper cache headers for static assets

### Runtime Optimization

- **Lazy Loading**: Components and routes are lazy loaded
- **Image Optimization**: WebP format with fallbacks
- **API Caching**: Intelligent caching with RTK Query
- **Memory Management**: Proper cleanup and monitoring

## 🔍 Monitoring

### Performance Monitoring

The app includes built-in performance monitoring:

- **Real-time Metrics**: API response times, memory usage
- **Error Tracking**: Comprehensive error boundaries
- **User Experience**: Loading states and smooth transitions

### Analytics Integration

Add analytics by setting environment variables:

```env
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=SENTRY_DSN_URL
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall
   - Check TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Restart development server after changes
   - Check deployment platform configuration

3. **API Errors**
   - Verify API endpoints are accessible
   - Check CORS configuration
   - Monitor API rate limits

### Support

If you encounter issues:

1. Check the [Issues](https://github.com/patheticnoob/gojoStreamNet/issues) page
2. Create a new issue with:
   - Deployment platform
   - Error messages
   - Environment details
   - Steps to reproduce

---

Happy deploying! 🎉
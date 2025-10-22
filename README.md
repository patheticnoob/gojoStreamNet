# 🎌 GojoStreamNet - Anime Streaming Platform

A modern, high-performance anime streaming platform built with React, TypeScript, and Material-UI. Features comprehensive error handling, performance optimization, and a Netflix-inspired user interface.

![GojoStreamNet Banner](https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=GojoStreamNet+-+Anime+Streaming+Platform)

## ✨ Features

### 🎯 Core Features
- **Anime Streaming**: High-quality anime streaming with multiple sources
- **Search & Discovery**: Advanced search with real-time suggestions
- **Episode Management**: Complete episode lists with progress tracking
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Theme**: Netflix-inspired dark UI with smooth animations

### 🚀 Performance & Reliability
- **Comprehensive Error Handling**: Smart retry logic with user-friendly error messages
- **Performance Monitoring**: Real-time performance metrics and optimization
- **Skeleton Loading**: Smooth loading states for better perceived performance
- **Intelligent Caching**: Advanced caching strategies for API responses and images
- **Bundle Optimization**: Optimized build size with code splitting

### 🎨 User Experience
- **Smooth Animations**: Framer Motion powered transitions
- **Image Optimization**: WebP format with fallbacks and lazy loading
- **Video Player**: Custom video player with subtitle support
- **Infinite Scroll**: Seamless content discovery
- **Keyboard Navigation**: Full keyboard accessibility

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Component library with custom theming
- **Redux Toolkit** - State management with RTK Query
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing

### APIs & Data
- **HiAnime API** - Anime metadata and information
- **Yuma API** - Streaming sources and episode data
- **Image Optimization** - WebP conversion and CDN integration

### Development & Build
- **Vite** - Fast build tool and development server
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Unit and integration testing
- **Docker** - Containerized deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/patheticnoob/gojoStreamNet.git
   cd gojoStreamNet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   VITE_APP_TITLE=GojoStreamNet
   VITE_HIANIME_API_URL=https://hianime-api-jzl7.onrender.com/api/v1
   VITE_YUMA_API_URL=https://yumaapi.vercel.app
   VITE_IMAGE_OPTIMIZATION_SERVICE=https://images.weserv.nl
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📦 Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```bash
docker build -t gojostreamnet .
docker run -p 3000:3000 gojostreamnet
```

### Vercel Deployment
This project is optimized for Vercel deployment:

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

The project includes:
- `vercel.json` - Vercel configuration
- Optimized build settings
- Static file handling
- SPA routing configuration

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── skeletons/      # Loading skeleton components
│   ├── watch/          # Video player components
│   └── __tests__/      # Component tests
├── hooks/              # Custom React hooks
├── layouts/            # Page layout components
├── pages/              # Route components
├── providers/          # Context providers
├── store/              # Redux store and slices
│   └── slices/         # RTK Query API slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
│   └── __tests__/      # Utility tests
└── theme/              # MUI theme configuration
```

## 🎯 Key Components

### Error Handling
- **ErrorBoundary**: Catches and handles React errors
- **ApiErrorBoundary**: Specialized for API failures
- **StreamingErrorBoundary**: Video streaming error handling
- **Retry Logic**: Exponential backoff for failed requests

### Performance Optimization
- **Performance Monitor**: Real-time metrics dashboard (dev only)
- **Image Optimization**: WebP conversion and lazy loading
- **Caching Strategies**: Intelligent API response caching
- **Bundle Splitting**: Optimized code splitting

### Streaming Features
- **Episode Player**: Custom video player with HLS support
- **Subtitle Controls**: Multi-language subtitle support
- **Quality Selection**: Adaptive streaming quality
- **Progress Tracking**: Episode watch progress

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Performance Metrics

The application includes built-in performance monitoring:

- **API Response Times**: Track and optimize API calls
- **Image Loading**: Monitor image optimization effectiveness
- **Memory Usage**: Detect and prevent memory leaks
- **Bundle Size**: Track and optimize build size

## 🔧 Configuration

### Environment Variables
- `VITE_APP_TITLE` - Application title
- `VITE_HIANIME_API_URL` - HiAnime API endpoint
- `VITE_YUMA_API_URL` - Yuma streaming API endpoint
- `VITE_IMAGE_OPTIMIZATION_SERVICE` - Image optimization service URL

### Build Configuration
- **Vite Config**: Optimized for production builds
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality rules
- **Prettier**: Code formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HiAnime API** - Anime metadata and information
- **Yuma API** - Streaming sources and episode data
- **Material-UI** - Component library and design system
- **React Community** - Amazing ecosystem and tools

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/patheticnoob/gojoStreamNet/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

<div align="center">
  <p>Made with ❤️ for anime lovers</p>
  <p>
    <a href="https://github.com/patheticnoob/gojoStreamNet">⭐ Star this repo</a> •
    <a href="https://github.com/patheticnoob/gojoStreamNet/issues">🐛 Report Bug</a> •
    <a href="https://github.com/patheticnoob/gojoStreamNet/issues">💡 Request Feature</a>
  </p>
</div>
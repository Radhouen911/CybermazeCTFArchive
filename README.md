# CTFd Arcade Theme - Frontend

A modern, arcade-style React frontend for CTFd (Capture The Flag platform). This theme transforms the traditional CTF experience into an immersive retro gaming interface with smooth animations, dynamic backgrounds, and an engaging user experience.

## 🎮 Architecture Overview

### Tech Stack

- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CTFd API** - Backend integration

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnimatedBackground.jsx
│   ├── ChallengeCard.jsx
│   ├── ChallengeModal.jsx
│   ├── Navbar.jsx
│   ├── NotificationBell.jsx
│   ├── TaskContainer.jsx
│   ├── TeamModal.jsx
│   └── TeamRequiredGuard.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── pages/              # Route pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Challenges.jsx
│   ├── Scoreboard.jsx
│   ├── Teams.jsx
│   ├── TeamManagement.jsx
│   ├── Users.jsx
│   ├── UserProfile.jsx
│   ├── PublicUserProfile.jsx
│   └── PublicTeamProfile.jsx
├── services/           # API integration
│   └── api.js
├── styles/             # CSS styling
│   ├── arcade.css
│   ├── modernArcade.css
│   ├── notifications.css
│   └── paths.css
├── data/               # Static data
├── config.js           # Configuration
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## 🔧 How It Works

### 1. Authentication Flow

- **AuthContext** manages global authentication state
- Handles login, registration, logout, and session persistence
- Provides user data and team information across the app
- Integrates with CTFd's session-based authentication

### 2. API Layer (`services/api.js`)

- Centralized API client for all CTFd endpoints
- Handles CSRF token management
- Supports:
  - Challenge management (fetch, submit flags)
  - User operations (profile, solves, awards)
  - Team operations (create, join, leave, manage)
  - Scoreboard data
  - Notifications polling
  - Whale plugin (Docker container management)

### 3. Routing & Guards

- React Router handles navigation
- **TeamRequiredGuard** protects routes requiring team membership
- Redirects unauthenticated users to login
- Smooth transitions between pages

### 4. Component Architecture

- **ChallengeCard** - Individual challenge display with arcade styling
- **ChallengeModal** - Full challenge details, flag submission, hints
- **NotificationBell** - Real-time notification polling (HTTP polling)
- **AnimatedBackground** - Dynamic video/image backgrounds
- **Navbar** - Responsive navigation with user menu

### 5. Styling System

- Custom arcade-themed CSS with retro aesthetics
- Responsive design for mobile and desktop
- Animated transitions and effects
- Video backgrounds with fallback support

### 6. Build Process

1. Vite builds the React app to `static/` directory
2. `sync-template.js` syncs assets to CTFd's template structure
3. CTFd serves the static files

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 📋 TODO List

### High Priority

- [ ] **WebSocket Plugin for Notifications** - Replace HTTP polling with WebSocket connections for real-time notifications, reducing server load and improving responsiveness
- [ ] **Admin Panel Detection & UI** - Detect admin users and provide admin-specific UI elements (challenge management, user moderation, statistics dashboard)
- [ ] **Performance Optimizations**
  - [ ] Implement React.lazy() for code splitting
  - [ ] Add service worker for offline support
  - [ ] Optimize bundle size (tree shaking, compression)
  - [ ] Implement virtual scrolling for large lists
  - [ ] Cache API responses with proper invalidation

### Medium Priority

- [ ] **Enhanced Notification System**
  - [ ] Sound effects for different notification types
  - [ ] Desktop notifications API integration
  - [ ] Notification preferences/settings
- [ ] **Accessibility Improvements**
  - [ ] ARIA labels and roles
  - [ ] Keyboard navigation
  - [ ] Screen reader support
- [ ] **Mobile Experience**
  - [ ] Touch gesture support
  - [ ] Mobile-optimized layouts
  - [ ] Progressive Web App (PWA) features

### Low Priority

    - [ ] **Animation Settings** - Toggle for reduced motion/animations

- [ ] **Internationalization (i18n)** - Multi-language support
- [ ] **Dark/Light Mode** - Additional theme variants
- [ ] **Challenge Filters** - Advanced filtering and search
- [ ] **Team Chat** - Built-in team communication

## 🎯 Key Features

- ✨ Retro arcade aesthetic with modern UX
- 🎮 Smooth animations and transitions
- 📱 Fully responsive design
- 🔔 Real-time notifications
- 🐳 Docker container management (Whale plugin)
- 👥 Team management and collaboration
- 🏆 Live scoreboard with rankings
- 🎨 Dynamic video backgrounds
- 🔐 Secure authentication flow

## 📝 Notes

- Built specifically for CTFd platform
- Requires CTFd backend to function
- Uses CTFd's native API endpoints
- Compatible with CTFd plugins (Whale, etc.)

---

**Designed by Angel911** • Powered by CTFd

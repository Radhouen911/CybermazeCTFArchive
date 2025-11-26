# CyberMaze CTFd Frontend - Implementation Context

## Overview

This is an arcade-themed CTFd frontend built with React 18 + Vite. The application features a retro gaming aesthetic with neon effects, video backgrounds, and interactive challenge paths. It replaces CTFd's default Jinja2 templates with a modern Single Page Application (SPA) while keeping the admin panel intact.

---

## Architecture

### How It Works

CTFd's theme system is used to serve a React SPA instead of traditional Jinja2 templates:

```
User Request → Nginx → CTFd Flask App
    ↓
CTFd checks active theme: "Arcade"
    ↓
Loads: CTFd/themes/Arcade/templates/base.html
    ↓
base.html contains: <script src="React app"></script>
    ↓
Browser loads React app → React Router takes over
    ↓
Single Page Application (SPA)
```

### Directory Structure

```
CTFd/themes/Arcade/
├── src/                      # React source code
│   ├── components/           # React components
│   ├── pages/               # Page components
│   ├── services/            # API service layer
│   ├── context/             # React Context (Auth)
│   ├── styles/              # CSS files
│   ├── config.js            # Configuration
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── templates/               # Jinja2 templates (load React)
│   ├── base.html           # Main template with React
│   ├── login.html          # Extends base
│   ├── register.html       # Extends base
│   ├── challenges.html     # Extends base
│   ├── scoreboard.html     # Extends base
│   └── users.html          # Extends base
├── static/                  # Built React app (generated)
│   ├── assets/             # JS and CSS bundles
│   │   ├── main-*.js       # React app bundle
│   │   └── main-*.css      # Styles bundle
│   └── ...                 # Images, videos, etc.
├── public/                  # Static assets (copied to static/)
├── __init__.py             # Theme loader (Python)
├── package.json            # npm dependencies
├── vite.config.js          # Vite build configuration
└── index.html              # Vite entry (not used by CTFd)
```

---

## Configuration

### `src/config.js`

```javascript
export const config = {
  apiBaseUrl: "/api/v1",
  devServer: {
    port: 3000,
    ctfdProxyUrl: "http://localhost:8000",
  },
};
```

- **Production:** Uses `/api/v1` for all API calls
- **Development:** Vite dev server proxies API calls to CTFd

---

## API Service Layer

### `src/services/api.js`

Handles all CTFd API interactions with proper authentication:

**Key Methods:**

- `getChallenges()` - Fetch all challenges
- `getChallenge(id)` - Fetch single challenge details
- `submitFlag(challengeId, submission)` - Submit flag for validation
- `getScoreboard()` - Fetch leaderboard data
- `getUsers()` - Fetch users list
- `getCurrentUser()` - Get current user info
- `login(name, password)` - Login with form data
- `register(name, email, password)` - Register new user
- `logout()` - Logout (GET request)
- `checkAuth()` - Verify authentication status

**Authentication:**

- Uses Flask session cookies (not JWT)
- Login/Register send form data (not JSON)
- Logout is a GET request to `/logout`
- Session persists across page reloads

---

## Authentication System

### Auth Context (`src/context/AuthContext.jsx`)

Global authentication state management using React Context:

**State:**

- `user` - Current user data
- `loading` - Auth check in progress
- `isAuthenticated` - Boolean auth status

**Methods:**

- `login(name, password)` - Login and set user state
- `register(name, email, password)` - Register and set user state
- `logout()` - Logout and clear user state
- `checkAuthStatus()` - Verify current auth status

**Usage:**

```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

---

## Challenge Paths (Categories)

### 1. The Neon Grid

- **Theme:** TRON • Light Cycles • Digital Frontier
- **Color:** Cyan (#00ffff)
- **Video:** `neonlights.mp4`
- **Challenges:** 5 (SQL Injection → XSS → CSRF → File Upload → Auth Bypass)

### 2. 8-Bit Pixel Palace

- **Theme:** PAC-MAN • Space Invaders • Donkey Kong
- **Color:** Yellow (#ffff00)
- **Challenges:** 5 (Caesar Cipher → Base64 → AES → RSA → Hash Collision)

### 3. Boss Battle Arena

- **Theme:** Street Fighter • Mortal Kombat • Final Fight
- **Color:** Red (#ff0000)
- **Video:** `battlear.mp4`
- **Challenges:** 5 (Crackme → Obfuscated Code → Buffer Overflow → Format String → Anti-Debug)

### 4. The Cyberpunk Alley

- **Theme:** Shadowrun • Cyberpunk 2077 • Neon Nights
- **Color:** Magenta (#ff00ff)
- **Video:** `cyberpunkalley.mp4`
- **Challenges:** 5 (Hidden in Plain Sight → Steganography → Network Traffic → Memory Dump → Disk Forensics)

### 5. Fantasy Quest Tavern

- **Theme:** Golden Axe • Gauntlet • Dungeon Crawlers
- **Color:** Orange (#ffa500)
- **Video:** `fantasy.mp4`
- **Challenges:** 5 (Dragon's Riddle → Enchanted Scroll → Dungeon Master → Wizard's Tower → Quest Complete)

### 6. Rhythm Revolution

- **Theme:** DDR • Guitar Hero • Beatmania
- **Color:** Deep Pink (#ff1493)
- **Video:** `rythmrevo.mp4`
- **Challenges:** 5 (Beat Detection → Frequency Analysis → Tempo Challenge → Perfect Combo → Final Performance)

---

## UI Components

### Key Components

**TaskContainer** (`src/components/TaskContainer.jsx`)

- Displays individual challenge cards
- Props: `taskName`, `points`, `onClick`, `isSolved`, `isLocked`, `taskNumber`, `pathColor`
- Uses `Task case.png` as background image

**Navbar** (`src/components/Navbar.jsx`)

- Shows username when logged in
- Logout button when authenticated
- Hides login/register when authenticated
- Uses auth context for state

**ChallengeModal**

- Opens when clicking a challenge
- Shows challenge details
- Allows flag submission
- Handles success/failure feedback

### Pages

**Home** (`src/pages/Home.jsx`)

- Landing page

**Login** (`src/pages/Login.jsx`)

- Login form with arcade theme
- Video background: `neonlights.mp4`
- Uses auth context

**Register** (`src/pages/Register.jsx`)

- Registration form with arcade theme
- Video background: `cyberpunkalley.mp4`
- Uses auth context

**Challenges** (`src/pages/Challenges_NEW.jsx`)

- Main challenge browsing interface
- Path navigation with triangle arrows
- Circular path indicators with shiny effects
- Video backgrounds per path
- Horizontal challenge grid layout
- Challenge unlocking based on requirements
- Sound effects on path switching (`SEL.mp3`)

**Scoreboard** (`src/pages/Scoreboard.jsx`)

- Leaderboard display

**Users** (`src/pages/Users.jsx`)

- Users list display

---

## Styling System

### CSS Files

- `src/styles/arcade.css` - Global arcade theme, navbar, footer
- `src/styles/paths.css` - Path-specific styling, navigation, challenge grid
- `src/styles/taskContainer.css` - TaskContainer component styling
- `src/styles/auth.css` - Authentication pages styling with neon effects

### Theme Variables

Each path uses CSS custom properties:

- `--path-color` - Primary theme color
- `--path-glow` - Glow effect for neon styling

---

## Build & Deployment

### Development Workflow

```bash
# Terminal 1: Run CTFd backend
docker-compose up

# Terminal 2: Run React dev server
cd CTFd/themes/Arcade
npm run dev

# Access at http://localhost:3000
# Hot reload enabled, instant changes
```

### Production Build

```bash
# Build React app
cd CTFd/themes/Arcade
npm install
npm run build

# This creates static/ folder with built files

# Restart CTFd to pick up changes
docker-compose restart ctfd
```

### Deployment

```bash
# Full deployment
cd CTFd/themes/Arcade
npm install
npm run build
cd ../../..
docker-compose up -d --build
```

---

## CTFd Integration

### Theme Loader (`__init__.py`)

Python file that CTFd calls when loading the theme. Currently not used because we rely on templates.

### Templates System

All templates extend `base.html` which loads the React app:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>{{ Configs.ctf_name or 'CyberMaze' }}</title>
    <script type="module" src="/themes/Arcade/static/assets/main-*.js"></script>
    <link rel="stylesheet" href="/themes/Arcade/static/assets/main-*.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### URL Routing

- **User pages** (`/`, `/login`, `/challenges`, etc.) → React app
- **Admin pages** (`/admin/*`) → CTFd's admin panel
- **API endpoints** (`/api/v1/*`) → CTFd backend

---

## CTFd API Compatibility

### Authentication Endpoints

**Login:**

- Endpoint: `/login` (not `/api/v1/login`)
- Method: POST with form data
- Content-Type: `application/x-www-form-urlencoded`
- Returns: HTML redirect or template with errors
- Session: Flask session cookies

**Register:**

- Endpoint: `/register` (not `/api/v1/register`)
- Method: POST with form data
- Content-Type: `application/x-www-form-urlencoded`
- Returns: HTML redirect or template with errors

**Logout:**

- Endpoint: `/logout` (not `/api/v1/logout`)
- Method: GET (not POST)
- Returns: Redirect to homepage

### Challenge Endpoints

**GET /api/v1/challenges:**

- Returns list of challenges
- Includes: `id`, `type`, `name`, `value`, `solves`, `solved_by_me`, `category`, `tags`
- Hidden challenges show as `{"type": "hidden", "name": "???"}`

**GET /api/v1/challenges/{id}:**

- Returns challenge details
- Includes: `description`, `files`, `hints`, `attempts`, `max_attempts`, `rating`

**POST /api/v1/challenges/attempt:**

- Submit flag
- Body: `{"challenge_id": 1, "submission": "flag{...}"}`
- Returns: `{"status": "correct|incorrect|partial|paused|ratelimited"}`

### User Endpoints

**GET /api/v1/users/me:**

- Returns current user data
- Requires authentication
- Includes: `id`, `name`, `email`, `score`, `place`

**GET /api/v1/scoreboard:**

- Returns leaderboard
- Includes: `pos`, `account_id`, `name`, `score`

---

## Current Status

### ✅ Working Features

- React frontend for all user-facing pages
- CTFd admin panel unchanged
- API authentication via session cookies
- Login/Register with form data
- Logout functionality
- Auth context for global state
- Challenge display and submission
- Scoreboard display
- User list display
- Session persistence across page reloads
- Responsive design
- Sound effects and animations

### ⚠️ Known Limitations

- No mock data (production-ready)
- Admin panel uses different theme (expected)
- Some CTFd features not implemented in React (hints, ratings, etc.)

### 🔧 Team Mode Support

**Issue:** When CTFd is in Team Mode, users must be on a team to view challenges. Without proper handling, users would see a 403 error.

**Solution:** Implemented team requirement detection in Challenges page:

1. **Detection:** When API returns 403 permission error, check if user is authenticated but has no team
2. **User Feedback:** Show friendly "Team Required" message with icon
3. **Action:** Provide "GO TO TEAMS" button to redirect to team creation/joining page
4. **Teams Page:** Fully functional team creation, joining, and leaving system

**How it works:**

- User without team tries to access challenges
- API returns 403 Forbidden
- React app detects: `isAuthenticated && !user.team_id`
- Shows team requirement message instead of error
- User clicks "GO TO TEAMS" button
- Can create or join a team
- After joining team, challenges become accessible

---

## Quick Reference

### Common Commands

```bash
# Build React app
cd CTFd/themes/Arcade && npm run build && cd ../../..

# Restart CTFd
docker-compose restart ctfd

# Restart nginx
docker-compose restart nginx

# View logs
docker-compose logs -f ctfd

# Full rebuild
docker-compose up -d --build
```

### File Locations

- **React source:** `CTFd/themes/Arcade/src/`
- **Built files:** `CTFd/themes/Arcade/static/`
- **Templates:** `CTFd/themes/Arcade/templates/`
- **Config:** `CTFd/themes/Arcade/src/config.js`
- **API service:** `CTFd/themes/Arcade/src/services/api.js`
- **Auth context:** `CTFd/themes/Arcade/src/context/AuthContext.jsx`

### URLs

- **User pages:** `http://localhost:8000/` (React app)
- **Admin panel:** `http://localhost:8000/admin` (CTFd)
- **API:** `http://localhost:8000/api/v1/*` (Backend)
- **Dev server:** `http://localhost:3000` (React dev mode)

---

## Troubleshooting

### React app doesn't load

```bash
# Rebuild and restart
cd CTFd/themes/Arcade && npm run build && cd ../../..
docker-compose restart ctfd
```

### Theme not applied

```bash
# Set theme via database
docker-compose exec db mysql -u ctfd -pctfd ctfd -e \
  "UPDATE config SET value='Arcade' WHERE key='ctf_theme';"
docker-compose restart ctfd
```

### API calls fail

- Check `src/config.js` has correct `apiBaseUrl`
- Verify CTFd backend is running
- Check browser console for errors
- Verify cookies are being set

### Changes not showing

- Clear browser cache (Ctrl+Shift+R)
- Rebuild React app
- Restart CTFd container
- Check browser console for errors

---

## Security Notes

- Database passwords are set in `docker-compose.yml`
- SECRET_KEY should be changed for production
- HTTPS should be enabled for production
- Firewall should only allow ports 80, 443
- Regular backups are essential

---

## Summary

This Arcade theme successfully integrates React 18 as the frontend for CTFd by exploiting the theme system to serve a SPA instead of traditional templates. The admin panel remains intact, and all CTFd backend functionality is preserved. The result is a modern, responsive, arcade-themed CTF platform with a seamless user experience.

---

## Recent Updates

### CSRF Token Integration (November 19, 2025)

**Problem:** Login and register were failing with 403 Forbidden errors due to CTFd's CSRF protection.

**Solution:** Integrated CTFd's session nonce into the React app:

1. **Updated `templates/base.html`:**

   - Added `window.init` object with CTFd session data
   - Includes `csrfNonce`, `userId`, `userName`, `userEmail`
   - Matches CTFd's core theme pattern

2. **Updated `src/services/api.js`:**

   - Changed `getNonce()` to read from `window.init.csrfNonce`
   - Removed unnecessary API calls to fetch nonce
   - Simplified login/register flows
   - Nonce is now included in all form submissions

3. **Fixed `src/App.jsx`:**
   - Added missing `UserProfile` import
   - Resolved build errors

**How it works:**

- CTFd renders `base.html` with session data embedded in `window.init`
- React app reads CSRF nonce from `window.init.csrfNonce`
- Login/register forms include nonce in form data
- CTFd validates nonce and processes authentication

**Build Process:**

```bash
cd CTFd/themes/Arcade
npm run build  # Builds and syncs templates automatically
docker-compose restart
```

### Challenge File Downloads (Implemented)

**File:** `src/components/ChallengeModal.jsx`

Challenge files are now properly displayed with download functionality:

- Files are extracted from challenge data
- Filenames are parsed from URLs (handles token-based URLs)
- Download attribute added for direct downloads
- Styled with arcade theme (cyan glow effects)
- Hover animations for better UX

**Styling:** `src/styles/paths.css`

- File list with arcade-themed styling
- Hover effects with glow
- Download icon animation
- Responsive layout

**How it works:**

1. CTFd returns file URLs with authentication tokens: `/files/path?token=xyz`
2. ChallengeModal extracts filename from URL
3. Displays file with icon and download button
4. Clicking downloads the file directly (browser handles authentication via cookies)

### User Profile Page (Implemented)

**File:** `src/pages/UserProfile.jsx`

Complete user profile page with all CTFd user functionalities:

**Features:**

- **Overview Tab:** User information, recent solves
- **Solves Tab:** Complete list of solved challenges with timestamps
- **Awards Tab:** All earned awards with descriptions
- **Settings Tab:** Profile editing (name, email, website, affiliation, country)

**Stats Display:**

- Rank/Place
- Total Score
- Number of Solves
- Number of Awards

**Profile Editing:**

- Update username
- Update email
- Update website
- Update affiliation
- Update country
- Form validation
- Success/error messages

**API Methods Added:**

- `updateProfile(data)` - PATCH /api/v1/users/me
- `getUserSolves()` - GET /api/v1/users/me/solves
- `getUserAwards()` - GET /api/v1/users/me/awards
- `getUserFails()` - GET /api/v1/users/me/fails

**Styling:** `src/styles/userProfile.css`

- Arcade-themed design
- Tabbed interface
- Responsive layout
- Hover effects and animations
- Form styling with validation feedback

**Access:** Click on username in navbar or navigate to `/profile`

### Templates Updated

Added `settings.html` template for profile page route.

**Theme Loader Routes (`__init__.py`):**

- `/` → React app (Home)
- `/login` → React app (Login)
- `/register` → React app (Register)
- `/challenges` → React app (Challenges)
- `/scoreboard` → React app (Scoreboard)
- `/users` → React app (Users list)
- `/profile` → React app (User profile) ✅ NEW
- `/settings` → React app (User settings) ✅ NEW

All routes serve the same React app, React Router handles the actual page rendering.

---

## Important: Asset Filename Syncing

**Problem:** Vite generates hashed filenames for assets (e.g., `main-BQZP63-U.js`) that change with each build.

**Solution:** The `sync-template.js` script automatically updates `templates/base.html` with the correct asset filenames after each build.

**Build Process:**

```bash
npm run build
# This runs:
# 1. vite build → Creates static/ folder with hashed filenames
# 2. node sync-template.js → Updates base.html with new filenames
```

**Manual Sync (if needed):**

```bash
node sync-template.js
```

This ensures `templates/base.html` always references the correct asset files.

---

## Team Management System (November 24, 2025)

### Overview

Complete team management system matching CTFd's core theme behavior with arcade styling.

### Team Management Page (`/team`)

**Two States:**

1. **User Has Team:**

   - Shows team name, rank, and score
   - Lists all team members with scores
   - Captain badge (👑) for team captain
   - Copy team name button (for sharing with others)
   - Leave team button (with confirmation modal)

2. **User Has No Team:**
   - Two options: CREATE TEAM or JOIN TEAM
   - Both options show forms when clicked
   - Forms require team name and password
   - Clean, simple interface

### Team Operations

**Create Team:**

- Requires: Team name, password
- Endpoint: `POST /api/v1/teams`
- No website field (simplified)

**Join Team:**

- Requires: Team name (not ID), password
- Endpoint: `POST /teams/join` (form submission)
- Matches core theme behavior exactly

**Leave Team:**

- Endpoint: `POST /teams/leave` (form submission)
- Shows custom confirmation modal (no browser prompt)
- Displays error if team has participated in event
- Reloads page on success

### Features

- **No Team Browsing:** Users don't see list of all teams
- **Name-Based Joining:** Join by team name, not ID
- **Captain Badge:** Visual indicator for team captain
- **Member Scores:** Shows individual member contributions
- **Confirmation Modal:** Custom arcade-styled confirmation for leaving
- **Error Handling:** Displays actual CTFd error messages
- **Success Messages:** Toast notifications for actions

### Navigation

- TEAM button in navbar (only shows in team mode)
- Redirects to `/team` page
- No modal popups - dedicated page

### Styling

- Arcade theme with neon effects
- Cyan/red color scheme
- Smooth animations
- Responsive design
- Custom confirmation modals

---

## Team Mode Enforcement

When CTFd is in team mode (`window.init.userMode === "teams"`):

1. **Protected Routes:** All routes except home, login, register, and teams require team membership
2. **TeamRequiredGuard:** Component that checks team membership and redirects
3. **Automatic Redirect:** Users without teams are redirected to `/teams` page
4. **Clear Messaging:** Shows "Team Required" message on challenges page if no team

---

---

## Users Page & Public Profiles (November 24, 2025)

### Users List Page (`/users`)

**Data Source:** Fetches from `/api/v1/users` endpoint (not scoreboard)

**Features:**

- Displays all registered users
- Shows individual user scores (not team scores)
- Fetches solve counts for each user
- Sorts by score descending
- Assigns proper rankings
- Clickable cards navigate to user profiles

**Important Notes:**

- User scores include: challenges + awards + bonuses (CTFd standard)
- A user with 1999 points and 1 solve is correct if they have awards
- Scores are fetched from individual user endpoints, not team data
- In team mode, shows individual user contributions, not team totals

### Public User Profile (`/users/{id}`)

**Fallback System:**

1. **Primary:** Tries `/api/v1/users/{id}` endpoint
2. **Fallback:** If restricted, gets data from scoreboard
3. **Graceful:** Shows basic info even if solves/awards are hidden

**Features:**

- Same card-based layout as own profile (`/profile`)
- Three tabs: Overview, Solves, Awards
- Shows user stats: rank, score, solves count, awards count
- Displays user info: affiliation, country, website
- Back link to users list
- Handles restricted public profiles

**API Behavior:**

- If CTFd has public profiles disabled, falls back to scoreboard data
- Solves and awards may be hidden based on CTFd settings
- Shows "No solves yet" / "No awards yet" if data unavailable

**Styling:**

- Matches `/profile` page exactly
- Same arcade theme and card layout
- Consistent tab structure
- Responsive design

---

---

## Registration System (November 24, 2025)

### Registration Code Support

The registration page now includes support for CTFd's registration code system.

**Register Page (`/register`):**

**Fields:**

- Username (required)
- Email (required)
- Password (required)
- Registration Code (optional)

**Registration Code Field:**

- Optional field for CTFd registration codes
- Labeled as "REGISTRATION CODE"
- Placeholder text: "Optional"
- Only validated if CTFd has registration codes enabled
- Sent to backend as `registration_code` parameter

**How It Works:**

1. User fills in registration form
2. If registration code is provided, it's included in the form submission
3. CTFd backend validates the code (if registration codes are enabled)
4. Invalid codes result in registration failure
5. If codes are not required, the field is ignored

**API Integration:**

```javascript
// Register with optional registration code
await api.register(name, email, password, registrationCode);

// Form data sent to /register endpoint:
// - name
// - email
// - password
// - registration_code (if provided)
// - nonce (CSRF token)
```

**CTFd Configuration:**

Registration codes can be enabled/disabled in CTFd admin settings:

- Admin Panel → Config → Registration Visibility
- If enabled, codes must be created in Admin Panel → Config → Registration Codes

---

## Registration System (November 24, 2025)

### Conditional Registration Code Support

The registration page dynamically shows/hides the registration code field based on CTFd backend configuration.

**Register Page (`/register`):**

**Standard Fields:**

- Username (required)
- Email (required)
- Password (required)

**Conditional Field:**

- Registration Code (required - only if enabled in CTFd)

**Registration Code Field:**

- **Visibility:** Only shows if `window.init.registrationCodeRequired` is true
- **Requirement:** Required when visible
- **Label:** "REGISTRATION CODE"
- **Backend Check:** CTFd configuration determines if field appears
- **Form Parameter:** `registration_code`

**How It Works:**

1. Page loads and checks `window.init.registrationCodeRequired`
2. If true (registration codes enabled in CTFd):
   - Registration code field appears
   - Field is required
   - User must enter valid code
3. If false (registration codes disabled):
   - Field does not appear at all
   - Registration works without code
4. Form submission includes code only if field is visible

**API Integration:**

```javascript
// Register with conditional registration code
await api.register(name, email, password, registrationCode);

// Form data sent to /register endpoint:
// - name (required)
// - email (required)
// - password (required)
// - registration_code (only if field was visible)
// - nonce (CSRF token)
```

**Backend Configuration:**

The `registrationCodeRequired` flag is set in `templates/base.html`:

```javascript
window.init = {
  // ... other config
  registrationCodeRequired: {{ 'true' if Configs.registration_code_required else 'false' }}
};
```

**CTFd Admin Settings:**

- Admin Panel → Config → Registration Visibility → Registration Code Required
- When enabled, admins must create codes in: Admin Panel → Config → Registration Codes
- Users can only register with valid codes when this is enabled

---

---

## Challenge Modal Enhancements (November 24, 2025)

### Markdown Processing

Challenge descriptions now support full Markdown formatting through a custom processor:

**Supported Syntax:**

- **Links:** `[text](url)` → Clickable hyperlinks (cyan, hover effects)
- **Blockquotes:** `> text` → Styled quotes (cyan left border, italic, gray background)
- **Bold:** `**text**` → `<strong>` (cyan color)
- **Italic:** `*text*` → `<em>` (magenta color)
- **Inline Code:** `` `code` `` → Styled code (green text, dark background)
- **Line Breaks:** `\n` → `<br />` tags

**Implementation:**

```javascript
const processMarkdown = (text) => {
  let html = text;
  html = html.replace(/\n/g, "<br />");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^&gt;\s*(.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  return html;
};
```

### Modal Design

**Compact Layout:**

- Max width: 600px
- Max height: 70vh
- Positioned 8vh from top
- Z-index: 10000 (above navbar)
- Reduced padding: 0.6rem throughout
- Smaller fonts: 0.8rem description, 1rem title

**Visual Features:**

- Cyan border with neon glow
- Dark gradient background
- Smooth slide-in animation
- Scrollable content area
- Backdrop blur effect

### Audio Feedback

**Fail Sound:**

- Plays on incorrect flag submission
- File: `/themes/Arcade/static/failsound.mp3`
- Volume: 50% (0.5)
- Graceful error handling

**Implementation:**

```javascript
if (result.data.status === "incorrect") {
  const failSound = new Audio("/themes/Arcade/static/failsound.mp3");
  failSound.volume = 0.5;
  failSound.play().catch((err) => console.log("Audio play failed:", err));
}
```

---

## Performance Optimizations (November 24, 2025)

### Users Page

**Removed:**

- Individual solve count fetching for each user
- N+1 query problem eliminated

**Display:**

- User rank
- User name
- User score (points only)

**Benefits:**

- Faster page load
- Fewer API calls
- Cleaner UI
- Better performance with many users

### Teams Page

**Card-Based Design:**

- Team badge and number
- Team name (large, uppercase)
- "VIEW DETAILS →" action text
- Gradient hover effects
- No score/member fetching

**Layout:**

- Grid: auto-fill, min 320px
- Responsive: single column on mobile
- Hover: lift effect with glow

---

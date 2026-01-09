# Pooja's Aura Artistry - Makeup Website

A beautiful, fully functional single-page application (SPA) for a professional makeup artist brand built with React, TypeScript, and TailwindCSS.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Admin Panel](#-admin-panel)
- [Data Storage](#-data-storage)
- [Version Management](#-version-management)
- [Tech Stack](#-tech-stack)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎨 Features

### Public Features
- **Modern, Responsive Design**: Soft, feminine, luxury salon vibes with a beautiful color palette
- **Home Page**: Hero section, services overview, featured portfolio, testimonials, and call-to-action
- **Services Page**: Detailed service listings with descriptions and pricing
- **Portfolio Page**: 
  - Image and video gallery with category filtering
  - Auto-refresh to show newly uploaded content (3-second interval)
  - Media modal for full-screen viewing
- **About Page**: Artist information and story
- **Enquiry Form**: Booking request form with validation
- **Feedback/Review Form**: Customer feedback with star ratings
- **Contact Page**: Quick enquiry form with contact information

### Admin Features
- **Admin Login**: Secure authentication with password visibility toggle
- **Dashboard**: 
  - View all enquiries with status management (PENDING/CONTACTED)
  - View all feedback with ratings
  - Reply to enquiries and feedback
  - Portfolio summary statistics
- **Portfolio Management**:
  - Upload images and videos (base64 encoded)
  - Add/Edit/Delete portfolio items
  - Category management
  - Tag system
- **Auto-updates**: Portfolio updates automatically across all open tabs

### Technical Features
- **LocalStorage Database**: Client-side data storage
- **Version Management**: Automatic version tracking and build numbers
- **Auto-refresh**: Real-time updates when admin adds content
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Type Safety**: Full TypeScript support

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v7.0.0 or higher (comes with Node.js)
- **Git**: (Optional) For version control

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: At least 500MB free space
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## 📦 Installation

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd site

# Or download and extract the project folder
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Step 4: Open in Browser

Navigate to `http://localhost:5173` in your web browser.

## 💻 Usage

### Development Mode

```bash
npm run dev
```

- Hot module replacement enabled
- Auto-reload on file changes
- Development tools enabled

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally before deploying.

### Code Linting

```bash
npm run lint
```

Check code for errors and style issues.

## 📁 Project Structure

```
poojas-aura-artistry/
├── public/                 # Static assets (images, videos, icons)
│   ├── favicon.svg
│   └── *.webp, *.mp4      # Portfolio images and videos
├── src/
│   ├── components/         # React components
│   │   ├── layout/        # Layout components (Navbar, Footer, Hero, Logo)
│   │   ├── sections/      # Page sections (FeaturedLooks, Testimonials, etc.)
│   │   └── ui/            # Reusable UI components (Button, Card, Input, etc.)
│   ├── lib/               # Utilities and core logic
│   │   ├── auth.ts        # Admin authentication
│   │   ├── localDb.ts     # localStorage database operations
│   │   ├── initPortfolio.ts # Portfolio initialization
│   │   └── version.ts     # Version management
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── EnquiryPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   └── AdminPortfolioPage.tsx
│   ├── routes/            # Route layouts
│   │   ├── PublicLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── types/             # TypeScript type definitions
│   │   ├── enquiry.ts
│   │   ├── feedback.ts
│   │   └── portfolio.ts
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── scripts/               # Utility scripts
│   └── version.js         # Version increment script
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
├── postcss.config.js      # PostCSS configuration
├── README.md              # This file
├── CHANGELOG.md           # Version history
└── README_VERSION.md      # Version management guide
```

## 🔐 Admin Panel

### Login Credentials

- **URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@poojasaura.com`
- **Password**: `AuraGlow123!`

### Admin Features

1. **Dashboard** (`/admin/dashboard`):
   - View and manage enquiries
   - View and respond to feedback
   - Portfolio statistics
   - Mark enquiries as contacted
   - Add/Edit/Delete replies

2. **Portfolio Management** (`/admin/portfolio`):
   - Upload new portfolio items (images/videos)
   - Edit existing items
   - Delete items
   - Manage categories and tags
   - All changes appear instantly on public pages

## 📝 Data Storage

### LocalStorage Keys

All data is stored in browser localStorage:

- **Enquiries**: `pooja_aura_enquiries` - All booking enquiries
- **Feedbacks**: `pooja_aura_feedbacks` - All customer feedback
- **Portfolio**: `pooja_aura_portfolio` - All portfolio items
- **Admin Auth**: `pooja_aura_admin_auth` - Admin login status
- **Version Info**: 
  - `app_version` - Current app version
  - `app_build_number` - Build number
  - `app_last_update` - Last update timestamp

### Data Persistence

- Data persists across browser sessions
- Data is browser-specific (each user has their own data)
- For shared data across users, consider implementing a backend API

### Auto-Refresh

Portfolio updates automatically:
- Every 3 seconds (auto-refresh interval)
- When localStorage changes (cross-tab updates)
- When page gains focus or becomes visible
- When admin adds/deletes portfolio items

## 📊 Version Management

The app includes automatic version tracking:

### Update Version

```bash
# Patch version (1.0.0 → 1.0.1) - Bug fixes
npm run version:patch

# Minor version (1.0.0 → 1.1.0) - New features
npm run version:minor

# Major version (1.0.0 → 2.0.0) - Breaking changes
npm run version:major
```

### Version Display

- **Footer**: Shows version on all public pages
- **Admin Header**: Shows version in admin panel
- **Format**: `v1.0.0 (Build 1)`

See [README_VERSION.md](./README_VERSION.md) for detailed version management guide.

## 🛠️ Tech Stack

### Core Technologies
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type safety and modern JavaScript
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.20.0** - Client-side routing

### Styling
- **TailwindCSS 3.3.6** - Utility-first CSS framework
- **PostCSS 8.4.32** - CSS processing
- **Autoprefixer 10.4.16** - Automatic vendor prefixes

### Icons & UI
- **Lucide React 0.294.0** - Icon library

### Development Tools
- **ESLint 8.55.0** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Plugin React** - React plugin for Vite

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code for errors |
| `npm run version` | Increment patch version |
| `npm run version:patch` | Increment patch version (1.0.0 → 1.0.1) |
| `npm run version:minor` | Increment minor version (1.0.0 → 1.1.0) |
| `npm run version:major` | Increment major version (1.0.0 → 2.0.0) |

## 🎨 Brand Colors

- **Soft Blush Pink**: `#F9E3E9` - Backgrounds and soft accents
- **Rose Accent**: `#E91E63` - Primary accent color
- **Deep Plum**: `#4A2C2A` - Text and dark elements

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, GitHub Pages):
   - Upload the `dist/` folder
   - Configure redirects for SPA routing

2. **Traditional Web Server** (Apache, Nginx):
   - Copy `dist/` contents to web root
   - Configure server for SPA routing

3. **CDN Deployment**:
   - Upload `dist/` to CDN
   - Configure caching and routing

### Environment Variables

No environment variables required for basic setup.

## 🔧 Configuration

### Vite Configuration
Located in `vite.config.ts` - Configure build options, plugins, and server settings.

### TailwindCSS Configuration
Located in `tailwind.config.js` - Customize colors, spacing, and design tokens.

### TypeScript Configuration
Located in `tsconfig.json` - TypeScript compiler options.

## 📚 Additional Documentation

- [Version Management Guide](./README_VERSION.md) - Detailed version system documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes

## 🤝 Contributing

1. Make your changes
2. Test thoroughly
3. Update version if needed: `npm run version:patch`
4. Update CHANGELOG.md
5. Submit for review

## 📞 Support

For issues or questions:
- Check existing documentation
- Review code comments
- Check browser console for errors

## 📄 License

This project is created for demonstration purposes.

---

**Current Version**: v1.0.0  
**Last Updated**: 2024-12-19  
**Maintained by**: Pooja's Aura Artistry Team


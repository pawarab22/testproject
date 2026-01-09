import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializePortfolio } from './lib/initPortfolio'
import { initializeAdminAuth } from './lib/auth'
import { initializeVersion } from './lib/version'
import { initializeData } from './lib/localDb'

  // Initialize admin auth and cleanup localStorage on page load/refresh
  // Run after DOM is ready to ensure localStorage is available
  if (typeof window !== 'undefined') {
    // Initialize version tracking
    try {
      initializeVersion();
    } catch (error) {
      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isDev) {
        console.error('Version initialization error:', error);
      }
    }

    // Clean up admin localStorage immediately on page load
    try {
      initializeAdminAuth();
    } catch (error) {
      // Silently handle initialization errors in development
      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isDev) {
        console.error('Admin auth initialization error:', error);
      }
    }

    // Initialize data from JSON files, then initialize portfolio
    initializeData().then(() => {
      // Wait a bit for data to be fully loaded, then initialize portfolio
      setTimeout(async () => {
        try {
          await initializePortfolio();
        } catch (error) {
          // Silently handle initialization errors in development
          const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          if (isDev) {
            console.error('Portfolio initialization error:', error);
          }
        }
      }, 1000); // Wait 1 second for data to be fully loaded
    }).catch(error => {
      const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isDev) {
        console.error('Data initialization error:', error);
      }
      // If initializeData fails, still try to initialize portfolio
      setTimeout(async () => {
        try {
          await initializePortfolio();
        } catch (error) {
          if (isDev) {
            console.error('Portfolio initialization error:', error);
          }
        }
      }, 1000);
    });
  }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


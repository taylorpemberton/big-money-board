import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App';

// Add this code to dynamically inject the Tailwind CDN script
const injectTailwindCDN = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
};

// Call the function to inject the script
injectTailwindCDN();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
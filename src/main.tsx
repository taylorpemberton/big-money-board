import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './tailwind.css';

// Add this code to dynamically inject the Tailwind CDN script
const injectTailwindCDN = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(script);
};

// Call the function to inject the script
injectTailwindCDN();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
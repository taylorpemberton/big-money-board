import { Event } from '../types/Event';

export const getSplashAnimation = (event?: Event) => {
  const details = event?.details.toLowerCase() || '';
  
  const color = details.includes('failed') 
    ? '#f87171' 
    : details.includes('new customer') 
      ? '#60a5fa' 
      : '#4ade80';

  return `
    @keyframes splash {
      0% { background-color: ${color}; }
      10% { background-color: ${color}; }
      100% { background-color: white; }
    }
  `;
};

export const createSplashAnimation = (event: Event) => {
  const style = document.createElement('style');
  style.textContent = getSplashAnimation(event);
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}; 
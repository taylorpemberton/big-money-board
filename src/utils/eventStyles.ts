import { Event } from '../types/Event';

type ColorPair = {
  background: string;
  text: string;
};

export const getEventColors = (event?: Event): ColorPair => {
  if (!event) return { background: 'bg-blue-50', text: 'text-blue-800' };
  
  const details = event.details.toLowerCase();
  
  if (details.includes('failed')) {
    return { background: 'bg-red-50', text: 'text-red-800' };
  }
  
  if (details.includes('new customer')) {
    return { background: 'bg-blue-50', text: 'text-blue-800' };
  }
  
  return { background: 'bg-green-50', text: 'text-green-800' };
}; 
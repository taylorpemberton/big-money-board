import { Event } from '../types/Event';

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    // Use a direct URL instead of window.location.origin
    // This ensures we're always hitting the correct API endpoint
    const apiUrl = '/api/events';
    console.log('Fetching events from:', apiUrl);
    
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${apiUrl}?_=${timestamp}`);
    
    // Log response status and headers for debugging
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      // Try to get the error text
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
    }
    
    // Check if response is empty
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.log('Empty response from API');
      return [];
    }
    
    // Check if the response is HTML instead of JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.warn('Received HTML instead of JSON, returning empty array');
      return [];
    }
    
    try {
      const data = JSON.parse(text);
      console.log(`Successfully parsed events data: ${data.length} events`);
      return data;
    } catch (e: unknown) {
      console.error('Error parsing JSON:', e);
      console.error('Raw response:', text);
      throw new Error(`Error parsing JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}; 
import React, { useState, useEffect, useRef } from 'react';
import { Event } from '../types/Event';
import { formatCurrency } from '../utils/formatting';
import { currencyToCountry } from '../utils/flags';

// Map configuration - easy to adjust dimensions and styling
export const MAP_CONFIG = {
  width: 1600, // Max width
  height: 800, // Max height
  svgHeight: 750,
  countryFill: '#e5e7eb', // gray-200 - lighter than before
  countryStroke: 'transparent', // no borders
  countryStrokeWidth: '0', // zero width
  viewBox: '0 150 800 500', // Further adjusted viewBox to center the map better
  desktopMargin: 80, // 80px margin on desktop
  mobileMargin: 20, // 20px margin on mobile
  mobileBreakpoint: 768, // Mobile breakpoint
};

// Currency codes to country codes mapping (ISO 3166-1 alpha-2)
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  USD: 'us', // United States Dollar
  GBP: 'gb', // British Pound
  EUR: 'de', // Euro (default to Germany)
  CAD: 'ca', // Canadian Dollar
  AUD: 'au', // Australian Dollar
  JPY: 'jp', // Japanese Yen
  CNY: 'cn', // Chinese Yuan
  INR: 'in', // Indian Rupee
  BRL: 'br', // Brazilian Real
  ZAR: 'za', // South African Rand
  RUB: 'ru', // Russian Ruble
  MXN: 'mx', // Mexican Peso
  CHF: 'ch', // Swiss Franc
  SEK: 'se', // Swedish Krona
  NZD: 'nz', // New Zealand Dollar
  SGD: 'sg', // Singapore Dollar
  HKD: 'hk', // Hong Kong Dollar
  NOK: 'no', // Norwegian Krone
  KRW: 'kr', // South Korean Won
  TRY: 'tr', // Turkish Lira
  AED: 'ae', // UAE Dirham
  DKK: 'dk', // Danish Krone
  PLN: 'pl', // Polish Zloty
  THB: 'th', // Thai Baht
  IDR: 'id', // Indonesian Rupiah
  HUF: 'hu', // Hungarian Forint
  CZK: 'cz', // Czech Koruna
  ILS: 'il', // Israeli Shekel
  CLP: 'cl', // Chilean Peso
  PHP: 'ph', // Philippine Peso
  ARS: 'ar', // Argentine Peso
  COP: 'co', // Colombian Peso
  PEN: 'pe', // Peruvian Sol
  MYR: 'my', // Malaysian Ringgit
  VND: 'vn', // Vietnamese Dong
};

interface WorldMapProps {
  events: Event[];
  isPaused: boolean;
}

interface EventDot {
  id: string;
  countryCode: string;
  type: string;
  details: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  opacity: number;
}

export function WorldMap({ events, isPaused }: WorldMapProps) {
  const [dots, setDots] = useState<EventDot[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [activeCountries, setActiveCountries] = useState<Record<string, number>>({});
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [latestEventCurrency, setLatestEventCurrency] = useState<string | null>(null);
  const [margin, setMargin] = useState(MAP_CONFIG.desktopMargin);
  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update margin based on viewport width
  useEffect(() => {
    function updateMargin() {
      const viewportWidth = window.innerWidth;
      setMargin(viewportWidth >= MAP_CONFIG.mobileBreakpoint 
        ? MAP_CONFIG.desktopMargin 
        : MAP_CONFIG.mobileMargin);
    }
    
    updateMargin();
    window.addEventListener('resize', updateMargin);
    
    return () => {
      window.removeEventListener('resize', updateMargin);
    };
  }, []);

  // Load SVG content
  useEffect(() => {
    console.log('Fetching world map SVG...');
    fetch('/world-map.svg')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        console.log('SVG loaded successfully, size:', data.length);
        setSvgContent(data);
      })
      .catch(error => {
        console.error('Error loading world map SVG:', error);
        // Try fallback location
        console.log('Trying fallback location...');
        fetch('/world-map-dots.svg')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to load fallback SVG: ${response.status} ${response.statusText}`);
            }
            return response.text();
          })
          .then(data => {
            console.log('Fallback SVG loaded successfully, size:', data.length);
            setSvgContent(data);
          })
          .catch(fallbackError => {
            console.error('Error loading fallback SVG:', fallbackError);
          });
      });
  }, []);

  // Initialize SVG reference after content is loaded
  useEffect(() => {
    if (svgContent && mapRef.current) {
      console.log('Initializing SVG content...');
      // Parse SVG content
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Check for parsing errors
      const parserError = svgDoc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error:', parserError.textContent);
        return;
      }
      
      // Set SVG styles for proper scaling
      svgElement.setAttribute('width', '90%'); // Smaller width to prevent cutoff
      svgElement.setAttribute('height', '90%'); // Smaller height to maintain aspect ratio
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      // Use the viewBox from config
      svgElement.setAttribute('viewBox', MAP_CONFIG.viewBox);
      
      // Set background to white
      const background = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('width', '100%');
      background.setAttribute('height', '100%');
      background.setAttribute('fill', '#ffffff');
      svgElement.insertBefore(background, svgElement.firstChild);
      
      // Apply styles to all paths
      const paths = svgElement.querySelectorAll('path');
      console.log(`Found ${paths.length} country paths in SVG`);
      
      // Log some path IDs for debugging
      const pathIds = Array.from(paths).slice(0, 5).map(path => path.id);
      console.log('Sample path IDs:', pathIds);
      
      paths.forEach(path => {
        path.setAttribute('fill', MAP_CONFIG.countryFill);
        path.setAttribute('stroke', MAP_CONFIG.countryStroke);
        path.setAttribute('stroke-width', MAP_CONFIG.countryStrokeWidth);
      });
      
      // Clear previous SVG if any
      if (mapRef.current.firstChild) {
        mapRef.current.removeChild(mapRef.current.firstChild);
      }
      
      // Append SVG to the container
      mapRef.current.appendChild(svgElement);
      svgRef.current = svgElement as unknown as SVGSVGElement;
      console.log('SVG initialized successfully');
    }
  }, [svgContent]);

  // Add new event dots when events change
  useEffect(() => {
    if (events.length === 0 || isPaused || !svgRef.current) return;

    const latestEvent = events[0];
    
    // Determine country from event
    let countryCode = latestEvent.country?.toLowerCase();
    
    if (!countryCode && latestEvent.currency) {
      const currencyCode = latestEvent.currency.toUpperCase();
      countryCode = CURRENCY_TO_COUNTRY[currencyCode];
    }
    
    // Default to US if no country found
    if (!countryCode) {
      countryCode = 'us';
    }
    
    // Set current location and currency
    const countryName = currencyToCountry[latestEvent.currency as keyof typeof currencyToCountry]?.name || 'United States';
    setCurrentLocation(countryName);
    setLatestEventCurrency(latestEvent.currency || 'USD');
    
    // Create new dot
    const newDot: EventDot = {
      id: `dot-${Date.now()}`,
      countryCode,
      type: latestEvent.type,
      details: latestEvent.details,
      amount: latestEvent.amount,
      currency: latestEvent.currency,
      timestamp: latestEvent.timestamp,
      opacity: 1
    };
    
    // Add new dot and limit to 50 dots
    setDots(prevDots => [newDot, ...prevDots.slice(0, 49)]);
    
    // Update active countries
    setActiveCountries(prev => ({
      ...prev,
      [countryCode]: 1
    }));
    
    // Highlight the country in the SVG
    highlightCountry(countryCode, getDotColor(latestEvent.type, latestEvent.details, 0.6));
    
    // Fade out dots and country highlights over time
    const fadeInterval = setInterval(() => {
      setDots(prevDots => 
        prevDots.map(dot => {
          if (dot.id === newDot.id) {
            // Reduce opacity
            const newOpacity = Math.max(0, dot.opacity - 0.02);
            
            // Update country highlight opacity
            if (newOpacity <= 0) {
              // Remove highlight when fully faded
              resetCountryHighlight(dot.countryCode);
              
              // Update active countries
              setActiveCountries(prev => {
                const updated = { ...prev };
                delete updated[dot.countryCode];
                return updated;
              });
            } else {
              // Update highlight opacity
              updateCountryHighlight(
                dot.countryCode, 
                getDotColor(dot.type, dot.details, newOpacity)
              );
            }
            
            return { ...dot, opacity: newOpacity };
          }
          return dot;
        }).filter(dot => dot.opacity > 0)
      );
    }, 100);
    
    return () => clearInterval(fadeInterval);
  }, [events, isPaused]);

  // Highlight a country in the SVG
  const highlightCountry = (countryCode: string, color: string) => {
    if (!svgRef.current) return;
    
    try {
      console.log(`Attempting to highlight country: ${countryCode}`);
      
      // Find the country path by ID
      let countryPath = svgRef.current.getElementById(countryCode);
      
      // If not found, try with uppercase (some SVGs might use uppercase IDs)
      if (!countryPath) {
        countryPath = svgRef.current.getElementById(countryCode.toUpperCase());
        if (countryPath) console.log(`Found country with uppercase ID: ${countryCode.toUpperCase()}`);
      }
      
      // If still not found, try with lowercase (some SVGs might use lowercase IDs)
      if (!countryPath) {
        countryPath = svgRef.current.getElementById(countryCode.toLowerCase());
        if (countryPath) console.log(`Found country with lowercase ID: ${countryCode.toLowerCase()}`);
      }
      
      if (countryPath) {
        // Store original fill for reset
        if (!countryPath.getAttribute('data-original-fill')) {
          countryPath.setAttribute('data-original-fill', countryPath.getAttribute('fill') || '#d1d5db');
        }
        
        // Apply highlight
        countryPath.setAttribute('fill', color);
        console.log(`Successfully highlighted country: ${countryCode}`);
      } else {
        console.warn(`Country path not found for code: ${countryCode}`);
      }
    } catch (error) {
      console.error(`Error highlighting country ${countryCode}:`, error);
    }
  };

  // Update country highlight opacity
  const updateCountryHighlight = (countryCode: string, color: string) => {
    if (!svgRef.current) return;
    
    try {
      // Try different case variations
      let countryPath = svgRef.current.getElementById(countryCode) || 
                        svgRef.current.getElementById(countryCode.toUpperCase()) || 
                        svgRef.current.getElementById(countryCode.toLowerCase());
                        
      if (countryPath) {
        countryPath.setAttribute('fill', color);
      }
    } catch (error) {
      console.error(`Error updating country highlight ${countryCode}:`, error);
    }
  };

  // Reset country highlight
  const resetCountryHighlight = (countryCode: string) => {
    if (!svgRef.current) return;
    
    try {
      // Try different case variations
      let countryPath = svgRef.current.getElementById(countryCode) || 
                        svgRef.current.getElementById(countryCode.toUpperCase()) || 
                        svgRef.current.getElementById(countryCode.toLowerCase());
                        
      if (countryPath) {
        const originalFill = countryPath.getAttribute('data-original-fill') || '#d1d5db';
        countryPath.setAttribute('fill', originalFill);
      }
    } catch (error) {
      console.error(`Error resetting country highlight ${countryCode}:`, error);
    }
  };

  // Get dot color based on event type
  const getDotColor = (type: string, details: string, opacity: number = 1) => {
    if (details.toLowerCase().includes('failed')) {
      return `rgba(239, 68, 68, ${opacity})`; // Red
    } else if (details.toLowerCase().includes('new customer') || details.toLowerCase().includes('signup')) {
      return `rgba(59, 130, 246, ${opacity})`; // Blue
    } else {
      return `rgba(34, 197, 94, ${opacity})`; // Green
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center" ref={containerRef}>
      {/* Location Display - Above the map */}
      {currentLocation && (
        <div className="fixed top-6 left-0 right-0 text-gray-600 text-2xl font-normal text-center z-50">
          <span className="mr-3">{latestEventCurrency && currencyToCountry[latestEventCurrency as keyof typeof currencyToCountry]?.flag || '🌍'}</span>
          {currentLocation}
          <span className="ml-3">{latestEventCurrency && currencyToCountry[latestEventCurrency as keyof typeof currencyToCountry]?.flag || '🌍'}</span>
        </div>
      )}

      {/* Paused Indicator */}
      {isPaused && (
        <div className="fixed top-16 left-0 right-0 text-gray-500 text-xl font-normal text-center z-50">
          Paused
        </div>
      )}
      
      {/* Map Container - White background, responsive width */}
      <div className="overflow-hidden bg-white z-0" 
           style={{ 
             width: `calc(100% - ${margin * 0}px)`,
             height: `calc(100% - ${margin * 0}px)`,
             maxWidth: `${MAP_CONFIG.width}px`,
             maxHeight: `${MAP_CONFIG.height}px`,
             aspectRatio: `${MAP_CONFIG.width} / ${MAP_CONFIG.height}`
           }}>
        {/* World Map SVG Container */}
        <div 
          ref={mapRef}
          className="w-full h-full"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 0,
            overflow: 'hidden' // Ensure content doesn't overflow
          }}
        >
          {!svgContent && (
            <div className="text-gray-400">
              <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Loading world map...</p>
            </div>
          )}
        </div>

        {/* Latest Event Panel - Bottom center of the map */}
        {events.length > 0 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-xl p-4 border border-gray-100 max-w-[300px] z-10">
            <div className="text-lg font-medium text-gray-800">{events[0].details}</div>
            {events[0].amount && (
              <div className="text-xl font-bold mt-1 text-gray-900">
                {formatCurrency(events[0].amount, events[0].currency || 'USD')}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              {new Date(events[0].timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
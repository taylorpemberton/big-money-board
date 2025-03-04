import React from 'react';

interface NavProps {
  activeTab: 'events' | 'mrr' | 'map';
  onTabChange: (tab: 'events' | 'mrr' | 'map') => void;
}

export const Nav: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-center space-x-4">
        <button
          onClick={() => onTabChange('events')}
          className={`px-4 py-2 rounded ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => onTabChange('mrr')}
          className={`px-4 py-2 rounded ${
            activeTab === 'mrr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          MRR
        </button>
        <button
          onClick={() => onTabChange('map')}
          className={`px-4 py-2 rounded ${
            activeTab === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Map
        </button>
      </div>
    </nav>
  );
}; 
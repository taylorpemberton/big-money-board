import React from 'react';

interface NavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Nav = ({ activeTab, onTabChange }: NavProps) => {
  return (
    <div className="flex justify-center mb-4 bg-gray-100 p-1 rounded-full w-fit mx-auto shadow-inner">
      <button
        onClick={() => onTabChange('events')}
        className={`px-6 py-2 rounded-full transition-all duration-200 ${
          activeTab === 'events' 
            ? 'bg-white shadow-lg text-blue-500' 
            : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        Events
      </button>
      <button
        onClick={() => onTabChange('mrr')}
        className={`px-6 py-2 rounded-full transition-all duration-200 ${
          activeTab === 'mrr' 
            ? 'bg-white shadow-lg text-blue-500' 
            : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        MRR
      </button>
    </div>
  );
}; 
import React, { useState } from 'react';
import { Events } from './Events';
import { MRR } from './MRR';
// import { Nav } from './Nav';

export const App = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4">
          {/* <Nav activeTab={activeTab} onTabChange={setActiveTab} /> */}
          
          {activeTab === 'events' ? (
            <Events />
          ) : (
            <MRR events={[]} />
          )}
        </div>
      </div>
    </div>
  );
}; 
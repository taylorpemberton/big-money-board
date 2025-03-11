import React from 'react';
import { formatCurrency } from '../utils/formatting';

interface RevenueProps {
  dailyRevenue: number;
  revenueChangeType: 'increase' | 'decrease' | 'neutral';
  currentView?: 'stream' | 'map';
}

export function Revenue({ 
  dailyRevenue, 
  revenueChangeType, 
  currentView = 'stream' 
}: RevenueProps) {
  const isMapView = currentView === 'map';
  
  // Determine color based on revenue change type
  const changeColor = 
    revenueChangeType === 'increase' ? 'text-green-500' :
    revenueChangeType === 'decrease' ? 'text-red-500' : 
    'text-gray-500';
  
  // Determine icon based on revenue change type
  const changeIcon = 
    revenueChangeType === 'increase' ? '↑' :
    revenueChangeType === 'decrease' ? '↓' : 
    '→';
  
  return (
    <div className={`
      fixed bottom-6 left-6 
      bg-white rounded-xl 
      z-20
      ${isMapView ? 'bg-opacity-90' : ''}
    `}>
      <div className="text-sm font-medium text-gray-500">Revenue Today</div>
      <div className="flex items-baseline mt-1">
        <div className="text-2xl font-medium text-gray-900">
          {formatCurrency(dailyRevenue, 'USD')}
        </div>
        <div className={`ml-2 text-sm font-medium ${changeColor}`}>
          {changeIcon} {revenueChangeType !== 'neutral' && revenueChangeType}
        </div>
      </div>
    </div>
  );
} 
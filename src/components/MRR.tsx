import React, { useState, useEffect } from 'react';
import { Event } from '../types/Event';

interface MRRProps {
  events: Event[];
}

export const MRR = ({ events }: MRRProps) => {
  const [mrr, setMrr] = useState(0);
  const [mrrHistory, setMrrHistory] = useState<number[]>([]);
  const [candleData, setCandleData] = useState<Array<{time: number, open: number, close: number, high: number, low: number}>>([]);

  useEffect(() => {
    // Initialize candle data for 24 hours
    if (candleData.length === 0) {
      const initialData = Array.from({length: 24}, (_, i) => ({
        time: i,
        open: 10000,
        close: 10000,
        high: 10000,
        low: 10000
      }));
      setCandleData(initialData);
    }

    const mrrInterval = setInterval(() => {
      setCandleData(prev => {
        const currentHour = new Date().getHours();
        const currentCandle = prev[currentHour];
        
        // Generate random price movement
        const change = Math.random() * 500 - 250;
        const newPrice = Math.max(0, currentCandle.close + change);
        
        const updatedCandle = {
          ...currentCandle,
          close: newPrice,
          high: Math.max(currentCandle.high, newPrice),
          low: Math.min(currentCandle.low, newPrice)
        };
        
        const newData = [...prev];
        newData[currentHour] = updatedCandle;
        return newData;
      });
    }, 1000);

    return () => clearInterval(mrrInterval);
  }, [candleData]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="w-[580px] h-[380px] rounded-3xl border-4 border-blue-400 p-6 relative">
      <div className="flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4">Monthly Recurring Revenue</h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-6xl font-bold">
            {formatCurrency(mrr, 'USD')}
          </span>
        </div>
        <div className="h-32 w-full">
          <CandleChart data={candleData} />
        </div>
      </div>
      
      {/* Event cell in bottom right */}
      {events[0] && (
        <div className="absolute bottom-4 right-4 w-48 p-3 rounded-lg">
          <div className="text-sm font-medium">{events[0].details}</div>
          {events[0].amount ? (
            <div className="text-lg font-semibold mt-1">
              {formatCurrency(events[0].amount, events[0].currency || 'USD')}
            </div>
          ) : (
            <div className="text-lg font-semibold mt-1">😃</div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {new Date(events[0].timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

// CandleChart component
const CandleChart = ({ data }: { data: Array<{time: number, open: number, close: number, high: number, low: number}> }) => {
  const maxValue = Math.max(...data.map(d => d.high));
  const minValue = Math.min(...data.map(d => d.low));

  return (
    <div className="w-full h-full flex items-end justify-between">
      {data.map((candle, index) => {
        const isUp = candle.close >= candle.open;
        const color = isUp ? 'bg-green-500' : 'bg-red-500';
        
        return (
          <div key={index} className="flex flex-col items-center h-full" style={{ width: `${100 / 24}%` }}>
            {/* Wick */}
            <div
              className="w-px bg-gray-400"
              style={{
                height: `${((candle.high - candle.low) / (maxValue - minValue)) * 100}%`
              }}
            />
            {/* Candle body */}
            <div
              className={`w-3/4 ${color} rounded-sm`}
              style={{
                height: `${(Math.abs(candle.close - candle.open) / (maxValue - minValue)) * 100}%`
              }}
            />
            {/* Hour label */}
            <div className="text-xs text-gray-500 mt-1">
              {candle.time}:00
            </div>
          </div>
        );
      })}
    </div>
  );
}; 
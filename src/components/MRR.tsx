import React, { useState, useEffect } from 'react';
import { Event } from '../types/Event';
import { formatCurrency } from '../utils/formatting';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-[580px]">
        <div className="text-4xl font-bold mb-8 text-center">
          {formatCurrency(mrr, 'USD')}
        </div>
        <div className="w-full h-[320px] bg-gray-50 rounded-3xl p-4">
          <CandleChart data={candleData} />
        </div>
      </div>
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
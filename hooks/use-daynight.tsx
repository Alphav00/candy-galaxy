'use client';

import React from 'react';
import { useEffect, useState, useMemo } from 'react';

interface TimeInfo {
  hour: number;
  isDay: boolean;
  isNight: boolean;
  isDawn: boolean;
  isDusk: boolean;
  phase: 'dawn' | 'day' | 'dusk' | 'night';
}

export function useDayNightCycle(): TimeInfo {
  const [timeInfo, setTimeInfo] = useState<TimeInfo>(() => getTimeInfo());

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeInfo(getTimeInfo());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return timeInfo;
}

function getTimeInfo(): TimeInfo {
  const hour = new Date().getHours();

  // Dawn: 5-7
  // Day: 7-18
  // Dusk: 18-20
  // Night: 20-5
  const isDawn = hour >= 5 && hour < 7;
  const isDay = hour >= 7 && hour < 18;
  const isDusk = hour >= 18 && hour < 20;
  const isNight = hour >= 20 || hour < 5;

  let phase: TimeInfo['phase'];
  if (isDawn) phase = 'dawn';
  else if (isDay) phase = 'day';
  else if (isDusk) phase = 'dusk';
  else phase = 'night';

  return { hour, isDay, isNight, isDawn, isDusk, phase };
}

// Get background gradient based on time
export function getBackgroundGradient(phase: TimeInfo['phase']): string {
  switch (phase) {
    case 'dawn':
      return 'linear-gradient(to bottom, #2d1b4e, #8b4d6b, #ff9a8b)';
    case 'day':
      return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)';
    case 'dusk':
      return 'linear-gradient(to bottom, #1a1a2e, #4a2c5a, #ff6b6b)';
    case 'night':
      return 'linear-gradient(to bottom, #0a0a1a, #1a1a2e, #16213e)';
    default:
      return 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)';
  }
}

// Get ambient light color based on time
export function getAmbientLightColor(phase: TimeInfo['phase']): string {
  switch (phase) {
    case 'dawn':
      return '#FFB6C1'; // Light pink
    case 'day':
      return '#FFE4F0'; // Soft pink
    case 'dusk':
      return '#FFA07A'; // Light salmon
    case 'night':
      return '#4169E1'; // Royal blue
    default:
      return '#FFE4F0';
  }
}

// Get ambient light intensity based on time
export function getAmbientLightIntensity(phase: TimeInfo['phase']): number {
  switch (phase) {
    case 'dawn':
      return 0.4;
    case 'day':
      return 0.5;
    case 'dusk':
      return 0.3;
    case 'night':
      return 0.15;
    default:
      return 0.3;
  }
}

// Component that provides time-based classes
interface DayNightBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function DayNightBackground({ children, className = '' }: DayNightBackgroundProps) {
  const timeInfo = useDayNightCycle();
  
  const bgClass = useMemo(() => {
    switch (timeInfo.phase) {
      case 'dawn':
        return 'bg-gradient-to-b from-purple-900 via-pink-700 to-orange-400';
      case 'day':
        return 'bg-gradient-to-b from-purple-900 via-purple-800 to-pink-900';
      case 'dusk':
        return 'bg-gradient-to-b from-purple-900 via-rose-700 to-orange-500';
      case 'night':
        return 'bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900';
      default:
        return 'bg-gradient-to-b from-purple-900 to-pink-900';
    }
  }, [timeInfo.phase]);

  return (
    <div className={`${bgClass} ${className}`}>
      {children}
    </div>
  );
}

export default useDayNightCycle;

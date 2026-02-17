import React from 'react';
import { PlanetConfig, MoonConfig } from '../types';

interface TooltipProps {
  x: number;
  y: number;
  planet: PlanetConfig | MoonConfig | null;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, planet }) => {
  if (!planet) return null;

  const isMoon = planet.type === 'moon';

  return (
    <div 
      className="absolute bg-black/80 backdrop-blur-md border border-gray-700 rounded-lg p-3 pointer-events-none z-50 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-opacity duration-200"
      style={{ top: y + 15, left: x + 15, width: '200px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{backgroundColor: planet.color}}></div>
        <span className="block font-bold text-white text-sm">{planet.name}</span>
      </div>
      <div className="text-gray-300 text-xs mb-2 line-clamp-3 leading-snug">{planet.description}</div>
      
      {!isMoon ? (
        <div className="text-gray-400 text-[10px] border-t border-gray-700 pt-1">
          Jarak Orbit: {(planet as PlanetConfig).distance} AU<br />
          {planet.name !== 'Matahari' && (
            <span>Periode: {(1/planet.speed).toFixed(2)} Tahun</span>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-[10px] border-t border-gray-700 pt-1 italic">
           Satelit Alami
        </div>
      )}
    </div>
  );
};
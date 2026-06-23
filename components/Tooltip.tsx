import React from 'react';
import { PlanetConfig, MoonConfig } from '../types';
import { Eye, Compass, Calendar, Moon } from 'lucide-react';

interface TooltipProps {
  x: number;
  y: number;
  planet: PlanetConfig | MoonConfig | null;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, planet }) => {
  if (!planet) return null;

  const isMoon = planet.type === 'moon';
  const isStar = planet.type === 'star';

  // Prevent tooltip from overflowing the viewport bounds
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  let leftPos = x + 15;
  let topPos = y + 15;
  
  if (leftPos + 220 > screenWidth) {
    leftPos = x - 235; // Position on left of cursor
  }
  
  if (topPos + 180 > screenHeight) {
    topPos = y - 195; // Position above cursor
  }

  return (
    <div 
      className="absolute bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3.5 pointer-events-none z-50 shadow-[0_0_20px_rgba(253,184,19,0.15)] transition-opacity duration-150 flex flex-col w-56 select-none"
      style={{ top: topPos, left: leftPos }}
    >
      {/* High tech scanner indicators */}
      <div className="flex items-center justify-between mb-1.5 border-b border-white/5 pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: planet.color }} />
          <span className="font-extrabold text-white text-xs tracking-wide uppercase">{planet.name}</span>
        </div>
        <span className="text-[9px] font-mono font-bold text-yellow-500 uppercase">
          {isMoon ? 'Satelit' : isStar ? 'Bintang' : 'Planet'}
        </span>
      </div>

      <div className="text-gray-400 text-[11px] mb-2 leading-relaxed text-justify line-clamp-3">
        {planet.description}
      </div>
      
      {/* Dynamic metrics */}
      {!isMoon ? (
        <div className="text-[10px] text-gray-500 border-t border-zinc-900 pt-1.5 space-y-1 font-mono">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-blue-400" /> Jarak Orbit:</span>
            <span className="text-gray-300 font-bold">{(planet as PlanetConfig).distance} AU</span>
          </div>
          {planet.name !== 'Matahari' && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-orange-400" /> Periode:</span>
              <span className="text-gray-300 font-bold">
                {planet.speed > 0 ? `${(1 / planet.speed).toFixed(1)} Thn` : 'N/A'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-[10px] text-gray-500 border-t border-zinc-900 pt-1.5 flex justify-between items-center font-mono">
          <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-violet-400" /> Tipe Satelit:</span>
          <span className="text-gray-300 font-bold font-sans">Alami</span>
        </div>
      )}

      {/* Tap indicator helper */}
      <div className="text-[9px] text-zinc-500/80 font-bold mt-2 text-center uppercase tracking-wider border-t border-zinc-900/40 pt-1 flex items-center justify-center gap-1">
        <Eye className="w-2.5 h-2.5" /> Klik untuk periksa detail
      </div>
    </div>
  );
};

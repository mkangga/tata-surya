import React from 'react';
import { PlanetConfig } from '../types';
import { PLANETS } from '../constants';

interface ControlsProps {
  speed: number;
  setSpeed: (val: number) => void;
  zoom: number;
  setZoom: (val: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  date: number;
  onSelectPlanet: (p: PlanetConfig) => void;
  following: string | null;
  showHabitableZone: boolean;
  setShowHabitableZone: (val: boolean) => void;
  showComets: boolean;
  setShowComets: (val: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  speed, setSpeed, zoom, setZoom, 
  isPlaying, togglePlay, date, 
  onSelectPlanet, following,
  showHabitableZone, setShowHabitableZone,
  showComets, setShowComets
}) => {
  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between">
      
      {/* Top Bar: Title & Simulation Date */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm">
            Tata Surya Karim
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
            <span className="bg-white/10 px-2 py-0.5 rounded border border-white/5">Real Scale Orbit</span>
            <span>1 AU = 100px</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-gray-700 rounded-lg px-4 py-2 text-right">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">Simulasi Waktu</div>
                <div className="text-lg font-mono font-bold text-blue-400">{formattedDate}</div>
            </div>
            
            <div className="bg-black/60 backdrop-blur-md border border-gray-700 rounded-lg p-2 flex flex-col gap-2">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-3 h-3 rounded-full border border-green-500 ${showHabitableZone ? 'bg-green-500' : 'bg-transparent'} transition-colors`}></div>
                  <input type="checkbox" checked={showHabitableZone} onChange={e => setShowHabitableZone(e.target.checked)} className="hidden" />
                  <span className="text-[10px] text-gray-300 group-hover:text-white uppercase font-bold">Zona Laik Huni</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-3 h-3 rounded-full border border-cyan-400 ${showComets ? 'bg-cyan-400' : 'bg-transparent'} transition-colors`}></div>
                  <input type="checkbox" checked={showComets} onChange={e => setShowComets(e.target.checked)} className="hidden" />
                  <span className="text-[10px] text-gray-300 group-hover:text-white uppercase font-bold">Tampilkan Komet</span>
               </label>
            </div>
        </div>
      </div>

      {/* Bottom Bar: Controls & Planet Picker */}
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between pointer-events-auto">
        
        {/* Playback Controls */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-4 shadow-2xl">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-transform active:scale-95"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
          </button>

          <div className="flex flex-col w-32">
            <label className="text-[10px] text-gray-400 font-bold flex justify-between">
              <span>KECEPATAN</span>
              <span>{speed.toFixed(1)}x</span>
            </label>
            <input
              type="range" min="0" max="10" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500 mt-1"
            />
          </div>

          <div className="w-px h-8 bg-white/20 mx-1"></div>

          <div className="flex flex-col w-32">
            <label className="text-[10px] text-gray-400 font-bold flex justify-between">
              <span>ZOOM</span>
              <span>{zoom.toFixed(2)}x</span>
            </label>
            <input
              type="range" min="0.05" max="4" step="0.01" value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
            />
          </div>
        </div>

        {/* Planet Quick Select */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
          {PLANETS.map(p => (
            <button
              key={p.name}
              onClick={() => onSelectPlanet(p)}
              className={`
                px-3 py-2 rounded-lg border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2
                ${following === p.name 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                  : 'bg-black/60 border-gray-700 text-gray-300 hover:bg-white/10 hover:border-white/30'}
                ${p.type === 'comet' && !showComets ? 'hidden' : ''}
              `}
            >
              <span className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></span>
              {p.name}
              {following === p.name && <i className="fas fa-video text-[10px]"></i>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
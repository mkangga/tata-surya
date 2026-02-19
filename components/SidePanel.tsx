import React from 'react';
import { PlanetConfig, MoonConfig } from '../types';

interface SidePanelProps {
  planet: PlanetConfig | MoonConfig | null;
  onClose: () => void;
  onFollow: (planetName: string) => void;
  isFollowing: boolean;
}

export const SidePanel: React.FC<SidePanelProps> = ({ planet, onClose, onFollow, isFollowing }) => {
  if (!planet) return null;

  const isMoon = planet.type === 'moon';
  const isDwarf = planet.type === 'dwarf';
  const isComet = planet.type === 'comet';

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {planet.name}
        </h2>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <i className="fas fa-times text-white"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {/* Preview Circle */}
        <div className="flex justify-center py-4">
          <div 
            className="w-32 h-32 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            style={{ 
              backgroundColor: planet.color,
              background: `radial-gradient(circle at 30% 30%, ${planet.color}, #000)`
            }}
          />
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          {isDwarf && <span className="inline-block px-2 py-0.5 mb-2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase border border-purple-500/50">Planet Kerdil</span>}
          {isComet && <span className="inline-block px-2 py-0.5 mb-2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase border border-cyan-500/50">Komet</span>}
          <p className="text-gray-300 text-sm leading-relaxed text-justify">{planet.description}</p>
        </div>

        {/* Conditional Rendering based on type */}
        {!isMoon ? (() => {
          // Explicit cast for TS safety inside this block
          const p = planet as PlanetConfig;
          return (
          <>
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-800 pb-2">Statistik Utama</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Jarak (AU)" value={p.distance.toString()} icon="fa-arrows-left-right" />
                <StatBox label="Diameter" value={p.diameter} icon="fa-ruler-combined" />
                <StatBox label="Suhu" value={p.temp} icon="fa-temperature-half" />
                <StatBox label="Rotasi" value={p.dayLength} icon="fa-rotate" />
                <StatBox label="Revolusi" value={p.yearLength} icon="fa-circle-notch" />
              </div>
            </div>

            {/* Moon List (Only for Planets) */}
            {p.moons && p.moons.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-gray-800 pb-2 flex items-center gap-2">
                  <i className="fas fa-moon text-[10px]"></i> Satelit Alami Utama
                </h3>
                <div className="space-y-3">
                  {p.moons.map((moon) => (
                    <div key={moon.name} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: moon.color }}></div>
                        <span className="font-bold text-sm text-gray-200">{moon.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">{moon.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 mt-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-lightbulb text-yellow-400 mt-1"></i>
                <div>
                  <h4 className="font-bold text-blue-200 text-sm mb-1">Tahukah Kamu?</h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed">{p.funFact}</p>
                </div>
              </div>
            </div>
          </>
          );
        })() : (
           /* Moon View */
           <div className="space-y-4">
              <div className="bg-white/5 p-3 rounded-lg flex items-center gap-3">
                 <i className="fas fa-circle-notch text-gray-400"></i>
                 <div>
                    <div className="text-[10px] uppercase text-gray-500 font-bold">Tipe Objek</div>
                    <div className="text-white text-sm">Satelit Alami (Bulan)</div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {!isMoon && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <button 
            onClick={() => onFollow(planet.name)}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isFollowing 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            <i className={`fas ${isFollowing ? 'fa-video-slash' : 'fa-video'}`}></i>
            {isFollowing ? 'Berhenti Mengikuti' : 'Ikuti Objek Ini'}
          </button>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
  <div className="bg-white/5 p-3 rounded-lg">
    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-semibold">
      <i className={`fas ${icon}`}></i>
      {label}
    </div>
    <div className="text-white text-sm font-medium break-words leading-tight">{value}</div>
  </div>
);
import React, { useState } from 'react';
import { PlanetConfig } from '../types';
import { PLANETS } from '../constants';
import { SpaceAudio } from '../audio';
import { 
  Play, Pause, Volume2, VolumeX, Scale, Gamepad2, PlusCircle, 
  Eye, EyeOff, Calendar
} from 'lucide-react';

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
  
  // Custom dialog openers
  onOpenCompare: () => void;
  onOpenQuiz: () => void;
  onOpenCreator: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  speed, setSpeed, zoom, setZoom, 
  isPlaying, togglePlay, date, 
  onSelectPlanet, following,
  showHabitableZone, setShowHabitableZone,
  showComets, setShowComets,
  onOpenCompare, onOpenQuiz, onOpenCreator
}) => {
  const [ambientSound, setAmbientSound] = useState(false);
  const [hideHud, setHideHud] = useState(false);

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleTogglePlay = () => {
    SpaceAudio.playClick();
    togglePlay();
  };

  const handleToggleSound = () => {
    const nextState = !ambientSound;
    setAmbientSound(nextState);
    SpaceAudio.toggleAmbience(nextState, 0.12);
    // Simple confirmation pop sound
    SpaceAudio.playSelect();
  };

  const handleZoomPreset = (type: 'inner' | 'gas' | 'all') => {
    SpaceAudio.playWarp();
    if (type === 'inner') {
      setZoom(1.5);
    } else if (type === 'gas') {
      setZoom(0.35);
    } else {
      setZoom(0.08);
    }
  };

  const triggerSelectPlanet = (p: PlanetConfig) => {
    SpaceAudio.playSelect();
    onSelectPlanet(p);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-3 sm:p-4 flex flex-col justify-between z-40 select-none">
      
      {/* 1. Header / Top Panel Row */}
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        {/* Brand/Title */}
        <div className="bg-zinc-950/80 backdrop-blur-md border border-white/15 p-3 rounded-2xl flex flex-col gap-1 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-white">
              Solar System
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold tracking-wide uppercase">
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-white border border-white/5 font-mono">Real-time Orrery</span>
            <span>1 AU ≈ 120px</span>
          </div>
        </div>

        {/* Global Toolbar Menu (Time Display, Sounds, Utility links) */}
        {!hideHud && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {/* Simulation Date Card */}
            <div className="bg-zinc-950/80 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-right shadow-xl">
              <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3 text-cyan-400" /> Simulasi Tarikh
              </div>
              <div className="text-xs sm:text-sm font-mono font-bold text-cyan-300 mt-0.5">{formattedDate}</div>
            </div>

            {/* Scientific Toggles Options Drawer (Habitable zone, comets, path lines) */}
            <div className="bg-zinc-950/80 backdrop-blur-md border border-white/15 rounded-2xl p-2 flex flex-col gap-2.5 shadow-xl">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showHabitableZone} 
                  onChange={e => { SpaceAudio.playClick(); setShowHabitableZone(e.target.checked); }} 
                  className="rounded bg-zinc-900 border-white/10 text-emerald-500 focus:ring-0 w-3 h-3 cursor-pointer" 
                />
                <span className="text-[9px] text-zinc-400 group-hover:text-emerald-400 uppercase font-bold tracking-wider">Zona Laik Huni</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={showComets} 
                  onChange={e => { SpaceAudio.playClick(); setShowComets(e.target.checked); }} 
                  className="rounded bg-zinc-900 border-white/10 text-cyan-400 focus:ring-0 w-3 h-3 cursor-pointer" 
                />
                <span className="text-[9px] text-zinc-400 group-hover:text-cyan-400 uppercase font-bold tracking-wider">Komet Sektor</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 2. Floating action bars (Compare, quiz, creator, zoom preset) (Middle Right) */}
      <div className="absolute right-3 sm:right-4 top-1/4 flex flex-col gap-2 pointer-events-auto z-40 items-end">
        {/* HUD Toggle (Minimize Everything) */}
        <button 
          onClick={() => { SpaceAudio.playClick(); setHideHud(!hideHud); }}
          className="p-2 w-9 h-9 rounded-full bg-zinc-950 border border-white/15 text-white hover:bg-zinc-900 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95"
          title={hideHud ? "Tampilkan HUD" : "Sembunyikan HUD"}
        >
          {hideHud ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
        </button>

        {!hideHud && (
          <>
            {/* Audio Toggle */}
            <button 
              onClick={handleToggleSound}
              className={`p-2 w-9 h-9 rounded-full border border-white/15 transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${
                ambientSound ? 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300' : 'bg-zinc-950 text-white hover:bg-zinc-900'
              }`}
              title={ambientSound ? "Matikan Suara" : "Nyalakan Suara Ruang Angkasa"}
            >
              {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Quick Zoom Presets bar */}
            <div className="bg-zinc-950/85 backdrop-blur-md border border-white/15 p-1 rounded-2xl flex flex-col gap-1 shadow-xl">
              <span className="text-[7px] text-zinc-500 font-extrabold text-center uppercase py-0.5 tracking-wider">Kamera</span>
              <button 
                onClick={() => handleZoomPreset('inner')}
                className="text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-white/10 text-white transition-colors uppercase"
                title="Zoom ke Planet Terrestrial"
              >
                Dalam
              </button>
              <button 
                onClick={() => handleZoomPreset('gas')}
                className="text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-white/10 text-white transition-colors uppercase"
                title="Zoom ke Raksasa Gas"
              >
                Luar
              </button>
              <button 
                onClick={() => handleZoomPreset('all')}
                className="text-[9px] font-bold px-2 py-1 rounded-lg hover:bg-white/10 text-white transition-colors uppercase"
                title="Lihat Peta Makro"
              >
                Penuh
              </button>
            </div>

            {/* Interactive Module Links (Quiz, Compare, Creator) */}
            <div className="bg-zinc-950/85 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl flex flex-col gap-1.5 shadow-xl">
              {/* Compare */}
              <button 
                onClick={() => { SpaceAudio.playClick(); onOpenCompare(); }}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Cek Komparasi Antar Planet"
              >
                <Scale className="w-4 h-4" />
              </button>

              {/* Quiz */}
              <button 
                onClick={() => { SpaceAudio.playClick(); onOpenQuiz(); }}
                className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg font-bold"
                title="Tes Kuis Antariksa"
              >
                <Gamepad2 className="w-4 h-4" />
              </button>

              {/* Spawner / Create Custom */}
              <button 
                onClick={() => { SpaceAudio.playClick(); onOpenCreator(); }}
                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                title="Buat Benda Langit Kustom"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 3. Bottom HUD controls (Planet list & playback control sliders) */}
      {!hideHud && (
        <div className="flex flex-col gap-3 pointer-events-auto shrink-0 w-full mt-auto">
          
          {/* Main Controls Overlay */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between w-full">
            
            {/* Speed & Zoom sliders card */}
            <div className="bg-zinc-950/85 backdrop-blur-md border border-white/15 p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shadow-2xl grow max-w-xl">
              {/* Play Pause Button */}
              <button 
                onClick={handleTogglePlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 self-center ${
                  isPlaying ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 shadow-[0_0_15px_rgba(253,184,19,0.4)] animate-pulse'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950 text-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 ml-0.5" />}
              </button>

              {/* Kepler speed slider */}
              <div className="flex flex-col grow">
                <div className="text-[8px] text-zinc-500 font-black tracking-widest flex justify-between select-none uppercase">
                  <span>Kecepatan Sistem</span>
                  <span className="text-yellow-400 mt-0.5 font-mono">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min="0" max="10" step="0.1" value={speed}
                  onChange={(e) => { SpaceAudio.playClick(); setSpeed(parseFloat(e.target.value)); }}
                  className="h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400 mt-1"
                />
              </div>

              {/* Vertical border line in desktop */}
              <div className="hidden sm:block w-px h-8 bg-white/10" />

              {/* Zoom scale slider */}
              <div className="flex flex-col grow">
                <div className="text-[8px] text-zinc-500 font-black tracking-widest flex justify-between select-none uppercase">
                  <span>Rasio Zoom Jagat</span>
                  <span className="text-cyan-400 mt-0.5 font-mono">{zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range" min="0.05" max="4" step="0.01" value={zoom}
                  onChange={(e) => { SpaceAudio.playClick(); setZoom(parseFloat(e.target.value)); }}
                  className="h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-1"
                />
              </div>
            </div>

            {/* Quick Jumper Navigation list */}
            <div className="bg-zinc-950/85 backdrop-blur-md border border-white/15 p-2 rounded-2xl flex flex-col justify-center shadow-2xl grow overflow-hidden">
              <span className="text-[7px] text-zinc-500 font-black tracking-widest uppercase px-2 mb-1">
                Lompat Peta Radar Orbit
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide px-1 select-none">
                {PLANETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => triggerSelectPlanet(p)}
                    className={`
                      px-2.5 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95
                      ${following === p.name 
                        ? 'bg-cyan-500 border-cyan-400 text-zinc-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-black' 
                        : 'bg-zinc-900 border-white/5 text-gray-300 hover:bg-zinc-800 hover:border-white/15'}
                      ${p.type === 'comet' && !showComets ? 'hidden' : ''}
                    `}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: p.color}} />
                    {p.name}
                    {following === p.name && <Eye className="w-2.5 h-2.5" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

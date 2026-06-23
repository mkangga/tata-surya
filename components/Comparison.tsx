import React, { useState } from 'react';
import { PlanetConfig, MoonConfig } from '../types';
import { PLANETS } from '../constants';
import { SpaceAudio } from '../audio';
import { X, Scale, ArrowLeftRight, Flame, RotateCw, RefreshCw, Moon, Eye } from 'lucide-react';

interface ComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  customPlanets: PlanetConfig[];
  onSelectObject: (p: PlanetConfig | MoonConfig) => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ isOpen, onClose, customPlanets, onSelectObject }) => {
  const allObjects: (PlanetConfig | MoonConfig)[] = [];
  
  // Combine all objects
  PLANETS.forEach(p => {
    allObjects.push(p);
    if (p.moons) {
      p.moons.forEach(m => {
        allObjects.push({ ...m, type: 'moon' as const } as unknown as PlanetConfig); // cast loosely for selection menu
      });
    }
  });

  customPlanets.forEach(cp => {
    allObjects.push(cp);
  });

  const [leftName, setLeftName] = useState<string>("Bumi");
  const [rightName, setRightName] = useState<string>("Mars");

  if (!isOpen) return null;

  const leftObj = allObjects.find(o => o.name === leftName) || allObjects[0];
  const rightObj = allObjects.find(o => o.name === rightName) || allObjects[1];

  // Helper to extract relative scale size
  const getRadiusVal = (obj: PlanetConfig | MoonConfig) => {
    return obj.radius;
  };

  const handleSelectLeft = (name: string) => {
    SpaceAudio.playClick();
    setLeftName(name);
  };

  const handleSelectRight = (name: string) => {
    SpaceAudio.playClick();
    setRightName(name);
  };

  const swapObjects = () => {
    SpaceAudio.playWarp();
    const temp = leftName;
    setLeftName(rightName);
    setRightName(temp);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[94vh] md:max-h-[88vh]">
        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Scale className="text-yellow-400 w-4.5 h-4.5 sm:w-5 sm:h-5 animate-pulse" />
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white">Komparasi Benda Langit</h2>
          </div>
          <button 
            type="button"
            onClick={() => { SpaceAudio.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors animate-fade-in"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Picker Row: Beautiful horizontal grid on all screens, compact on mobile */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 p-3 sm:p-5 bg-zinc-900/40 border-b border-white/5 items-center">
          {/* Left Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-500 font-extrabold">Objek Kiri</label>
            <select 
              value={leftName} 
              onChange={(e) => handleSelectLeft(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-white rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-semibold focus:outline-none focus:border-yellow-400 max-w-full cursor-pointer"
            >
              {allObjects.map(obj => (
                <option key={`left-${obj.name}`} value={obj.name}>
                  {obj.name} {obj.type === 'moon' ? '🌙' : obj.type === 'dwarf' ? '🪐' : obj.type === 'comet' ? '💫' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pt-3.5">
            <button 
              onClick={swapObjects}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-yellow-400 text-zinc-950 font-bold flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-md shadow-yellow-400/20"
              title="Tukar Objek"
            >
              <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Right Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] sm:text-xs uppercase tracking-wider text-gray-500 font-extrabold">Objek Kanan</label>
            <select 
              value={rightName} 
              onChange={(e) => handleSelectRight(e.target.value)}
              className="bg-zinc-950 border border-white/10 text-white rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-sm font-semibold focus:outline-none focus:border-yellow-400 max-w-full cursor-pointer"
            >
              {allObjects.filter(obj => obj.name !== leftName).map(obj => (
                <option key={`right-${obj.name}`} value={obj.name}>
                  {obj.name} {obj.type === 'moon' ? '🌙' : obj.type === 'dwarf' ? '🪐' : obj.type === 'comet' ? '💫' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Comparison Grid - Dynamically handles its own flex bounds strictly */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 custom-scrollbar">
          {/* Interactive Visual Scale Comparison */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-6">Perbandingan Skala Ukuran</h3>
            <div className="flex w-full items-center justify-around h-36 relative">
              {/* Left Planet Circle Representer */}
              <div className="flex flex-col items-center justify-end h-full w-1/2">
                <div 
                  className="rounded-full shadow-2xl transition-all duration-500 relative flex items-center justify-center border border-white/10"
                  style={{
                    width: `${getRadiusVal(leftObj) * 8}px`,
                    height: `${getRadiusVal(leftObj) * 8}px`,
                    maxWidth: '120px',
                    maxHeight: '120px',
                    minWidth: '15px',
                    minHeight: '15px',
                    background: `radial-gradient(circle at 35% 35%, ${leftObj.color}, #000 95%)`,
                    boxShadow: `0 0 25px ${leftObj.color}40`
                  }}
                />
                <span className="text-sm font-bold text-gray-300 mt-2">{leftObj.name}</span>
                <span className="text-[10px] text-gray-500">R: {getRadiusVal(leftObj)} pt</span>
              </div>

              {/* VS Divider */}
              <div className="absolute text-yellow-400 text-xs font-black tracking-widest bg-zinc-950 border border-yellow-400/20 px-2 py-0.5 rounded-md">VS</div>

              {/* Right Planet Circle Representer */}
              <div className="flex flex-col items-center justify-end h-full w-1/2">
                <div 
                  className="rounded-full shadow-2xl transition-all duration-500 relative flex items-center justify-center border border-white/10"
                  style={{
                    width: `${getRadiusVal(rightObj) * 8}px`,
                    height: `${getRadiusVal(rightObj) * 8}px`,
                    maxWidth: '120px',
                    maxHeight: '120px',
                    minWidth: '15px',
                    minHeight: '15px',
                    background: `radial-gradient(circle at 35% 35%, ${rightObj.color}, #000 95%)`,
                    boxShadow: `0 0 25px ${rightObj.color}40`
                  }}
                />
                <span className="text-sm font-bold text-gray-300 mt-2">{rightObj.name}</span>
                <span className="text-[10px] text-gray-500">R: {getRadiusVal(rightObj)} pt</span>
              </div>
            </div>
          </div>

          {/* Stats Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-white/10 pb-1.5">Metrik Parameter</h3>

            {/* Metric Row: Type */}
            <ComparisonRow 
              label="Tipe Celestial" 
              leftValue={leftObj.type === 'star' ? 'Bintang Utama' : leftObj.type === 'planet' ? 'Planet Utama' : leftObj.type === 'dwarf' ? 'Planet Kerdil' : leftObj.type === 'comet' ? 'Komet Magnetis' : 'Satelit Alami'} 
              rightValue={rightObj.type === 'star' ? 'Bintang Utama' : rightObj.type === 'planet' ? 'Planet Utama' : rightObj.type === 'dwarf' ? 'Planet Kerdil' : rightObj.type === 'comet' ? 'Komet Magnetis' : 'Satelit Alami'}
              icon={<Scale className="w-3.5 h-3.5 text-blue-400" />}
            />

            {/* Metric Row: Orbit Distance */}
            <ComparisonRow 
              label="Jarak Orbit (AU)" 
              leftValue={leftObj.type !== 'moon' ? `${(leftObj as PlanetConfig).distance} AU` : 'Mengorbit Induk'} 
              rightValue={rightObj.type !== 'moon' ? `${(rightObj as PlanetConfig).distance} AU` : 'Mengorbit Induk'}
              icon={<ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />}
            />

            {/* Metric Row: Diameter */}
            <ComparisonRow 
              label="Diameter Fisik" 
              leftValue={leftObj.type !== 'moon' ? (leftObj as PlanetConfig).diameter : 'Variatif'} 
              rightValue={rightObj.type !== 'moon' ? (rightObj as PlanetConfig).diameter : 'Variatif'} 
              icon={<Scale className="w-3.5 h-3.5 text-purple-400" />}
            />

            {/* Metric Row: Temp */}
            <ComparisonRow 
              label="Suhu Permukaan" 
              leftValue={leftObj.type !== 'moon' ? (leftObj as PlanetConfig).temp : 'Sangat Dingin/Panas'} 
              rightValue={rightObj.type !== 'moon' ? (rightObj as PlanetConfig).temp : 'Sangat Dingin/Panas'}
              icon={<Flame className="w-3.5 h-3.5 text-red-400" />}
            />

            {/* Metric Row: Day Length */}
            <ComparisonRow 
              label="Hari (Rotasi Semu)" 
              leftValue={leftObj.type !== 'moon' ? (leftObj as PlanetConfig).dayLength : 'Sinkron'} 
              rightValue={rightObj.type !== 'moon' ? (rightObj as PlanetConfig).dayLength : 'Sinkron'}
              icon={<RotateCw className="w-3.5 h-3.5 text-cyan-400" />}
            />

            {/* Metric Row: Year Length */}
            <ComparisonRow 
              label="Tahun (Orbit Revolusi)" 
              leftValue={leftObj.type !== 'moon' ? (leftObj as PlanetConfig).yearLength : 'Sinkron'} 
              rightValue={rightObj.type !== 'moon' ? (rightObj as PlanetConfig).yearLength : 'Sinkron'}
              icon={<RefreshCw className="w-3.5 h-3.5 text-orange-400" />}
            />

            {/* Metric Row: Moons count */}
            <ComparisonRow 
              label="Jumlah Satelit Alami" 
              leftValue={leftObj.type !== 'moon' ? `${((leftObj as PlanetConfig).moons || []).length} Bulan` : 'Tidak Ada'} 
              rightValue={rightObj.type !== 'moon' ? `${((rightObj as PlanetConfig).moons || []).length} Bulan` : 'Tidak Ada'}
              icon={<Moon className="w-3.5 h-3.5 text-violet-400" />}
            />
          </div>

          {/* Quick descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold text-yellow-400 uppercase mb-2">Ikhtisar {leftObj.name}</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">{leftObj.description}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-bold text-yellow-400 uppercase mb-2">Ikhtisar {rightObj.name}</h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">{rightObj.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900 border-t border-white/5 flex gap-4 md:flex-row flex-col justify-between items-center text-xs text-gray-400">
          <span>* Catatan: Nilai AU (Astronomical Unit) dihitung relatif dari jarak Bumi ke Matahari.</span>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                SpaceAudio.playSelect();
                onSelectObject(leftObj);
                onClose();
              }}
              className="bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold px-3 py-1.5 rounded transition-transform active:scale-95 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Lihat {leftObj.name}
            </button>
            <button 
              onClick={() => {
                SpaceAudio.playSelect();
                onSelectObject(rightObj);
                onClose();
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 font-bold px-3 py-1.5 rounded transition-transform active:scale-95 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Lihat {rightObj.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ComparisonRowProps {
  label: string;
  leftValue: string;
  rightValue: string;
  icon?: React.ReactNode;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({ label, leftValue, rightValue, icon }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-2 border-b border-white/5 items-center hover:bg-white/5 px-2 rounded transition-colors text-sm">
    <div className="md:col-span-4 flex items-center gap-2 text-gray-400 font-medium">
      {icon}
      <span>{label}</span>
    </div>
    <div className="md:col-span-4 font-semibold text-white md:text-left">{leftValue}</div>
    <div className="md:col-span-4 font-semibold text-gray-300 md:text-left">{rightValue}</div>
  </div>
);

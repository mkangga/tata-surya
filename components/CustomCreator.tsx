import React, { useState, useEffect } from 'react';
import { PlanetConfig, MoonConfig } from '../types';
import { SpaceAudio } from '../audio';
import { 
  X, Sparkles, Orbit, Landmark, 
  Wind, Layers, Compass
} from 'lucide-react';

interface CustomCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newPlanet: PlanetConfig) => void;
}

// Visual and composition presets
const PRESET_MATERIALS = [
  { name: 'Rocky Silikat (Merah Kuning)', color: '#d35400', colors: ['#e74c3c', '#d35400', '#2c3e50'], desc: 'Kaya akan silikat gersang dan besi oksida.' },
  { name: 'Dunia Samudera (Biru Riam)', color: '#1abc9c', colors: ['#3498db', '#1abc9c', '#1b4f72'], desc: 'Diliputi lautan global eksotis super dalam.' },
  { name: 'Icy Kriosfer (Ikan Es/Cyan)', color: '#9fe4fa', colors: ['#ffffff', '#a8e6cf', '#3b5998'], desc: 'Permukaan es nitrogen kokoh di batas tata surya.' },
  { name: 'Batu Karbida (Emas Hitam)', color: '#f39c12', colors: ['#f1c40f', '#f39c12', '#1a252f'], desc: 'Dilapisi grafit pekat dan batuan karbonat.' },
  { name: 'Gas Raksasa (Titanium Oranye)', color: '#e67e22', colors: ['#f39c12', '#e67e22', '#78281f'], desc: 'Atmosfer hidrogen-helium masif berkecepatan tinggi.' },
  { name: 'Magnetis Aura (Ungu Plasma)', color: '#9b59b6', colors: ['#ffffff', '#9b59b6', '#4a235a'], desc: 'Awan magnetosfer memendarkan radiasi kosmik ungu.' },
];

export const CustomCreator: React.FC<CustomCreatorProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'planet' | 'dwarf' | 'comet'>('planet');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  
  // Custom Color override
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [customColor1, setCustomColor1] = useState('#3498db');
  const [customColor2, setCustomColor2] = useState('#2be4a4');
  const [customColor3, setCustomColor3] = useState('#121e4a');

  // Orbit Geometry Parameters
  const [distance, setDistance] = useState(2.8); // AU
  const [radius, setRadius] = useState(8); // Size
  const [eccentricity, setEccentricity] = useState(0.06); 
  const [speed, setSpeed] = useState(1.2); 

  // Advanced components
  const [hasRing, setHasRing] = useState(false);
  const [atmosphere, setAtmosphere] = useState<'none' | 'nitrogen' | 'co2' | 'methane' | 'hydrogen'>('nitrogen');
  const [moonsCount, setMoonsCount] = useState<number>(0);

  // Auto-generate name hints based on type
  useEffect(() => {
    if (!name && isOpen) {
      const prefixes = type === 'comet' ? ['Komet-XYZ', 'Icarus', 'Hyperion', 'Halley-Neo'] : ['Zetacus', 'Krypton', 'Gliese-K', 'Astraea', 'Genesis'];
      const randomPref = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomNum = Math.floor(100 + Math.random() * 899);
      setName(`${randomPref} ${randomNum}`);
    }
  }, [type, isOpen]);

  if (!isOpen) return null;

  // Resolve active colors
  const activeColors = useCustomColors
    ? [customColor1, customColor2, customColor3]
    : PRESET_MATERIALS[selectedPresetIdx].colors;

  const activeBaseColor = useCustomColors ? customColor1 : PRESET_MATERIALS[selectedPresetIdx].color;

  // Real-time calculated physics metrics
  const massRatio = Math.pow(radius / 7, 3);
  const surfaceGravity = radius / 7;
  const escapeVelocity = 11.2 * (radius / 7);

  // Habitable zone calculation
  let habitabilityStatus = 'Zona Beku Abadi (Sangat Dingin)';
  let habitabilityColor = 'text-sky-400';
  if (distance < 0.8) {
    habitabilityStatus = 'Zona Radiasi Terbakar (Terlalu Panas)';
    habitabilityColor = 'text-red-400';
  } else if (distance >= 0.8 && distance <= 1.5) {
    habitabilityStatus = 'Zona Layak Huni (Suhu Ideal)';
    habitabilityColor = 'text-emerald-400';
  }

  const atmosphereLabels = {
    none: 'Tanpa Atmosfer (Hampa)',
    nitrogen: 'Nitrogen-Oksigen (Dunia Bumi)',
    co2: 'Karbondioksida Pekat (Efek Rumah Kaca)',
    methane: 'Methane Hidrokarbon (Icy Dunia)',
    hydrogen: 'Hidrogen & Helium Ringan (Gas Raksat)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    SpaceAudio.playWarp();

    // Generate orbiting satellites if moonsCount > 0
    const generatedMoons: MoonConfig[] = [];
    const moonColors = ['#e5e7eb', '#cbd5e1', '#94a3b8', '#ede9fe', '#ffedd5'];
    
    for (let m = 0; m < moonsCount; m++) {
      generatedMoons.push({
        name: `Satelit ${name.trim()} - ${String.fromCharCode(65 + m)}`,
        radius: parseFloat((0.4 + Math.random() * 0.4).toFixed(1)),
        distance: 12 + m * 6,
        speed: parseFloat((4 + Math.random() * 5).toFixed(1)),
        color: moonColors[m % moonColors.length],
        description: `Satelit alami batuan es pengorbit setia yang mengawal keselarasan ekologi sistem kustom ${name}.`,
        type: 'moon'
      });
    }

    const newPlanet: PlanetConfig = {
      name: name.trim(),
      color: activeBaseColor,
      colors: activeColors,
      radius: radius,
      distance: distance,
      eccentricity: eccentricity,
      speed: speed * 0.35, // apply correction scale factor
      description: `Benda langit kustom ciptaan pengguna sistem simulasi Tata Surya. Klasifikasi fisik: ${type === 'comet' ? 'Komet Magnetis' : type === 'dwarf' ? 'Planet Kerdil' : radius > 10 ? 'Raksasa Gas' : 'Planet Terestrial'}. Atmosfer yang melingkupi didominasi oleh gas ${atmosphereLabels[atmosphere]}.`,
      type: type,
      hasRing: hasRing,
      moons: generatedMoons.length > 0 ? generatedMoons : undefined,
      diameter: `${Math.round(radius * 1630).toLocaleString()} km`,
      temp: `${Math.round(270 / Math.sqrt(distance) - (atmosphere === 'co2' ? 70 : 160))}°C`,
      dayLength: `${Math.round(12 + (12 / speed))} Jam`,
      yearLength: `${(Math.sqrt(Math.pow(distance, 3))).toFixed(1)} Tahun Bumi`,
      funFact: `Merupakan simulasi materi ke-${Math.floor(100 + Math.random()*800)} yang lahir dari akumulasi debu protoplanet kustom berkualitas.`
    };

    onCreate(newPlanet);
    
    // Reset defaults
    setName('');
    setSelectedPresetIdx(0);
    setUseCustomColors(false);
    setDistance(2.8);
    setRadius(8);
    setEccentricity(0.06);
    setSpeed(1.2);
    setHasRing(false);
    setAtmosphere('nitrogen');
    setMoonsCount(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[95vh] md:max-h-[88vh]">
        
        {/* Modular CSS animation codes */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes orbit-moon-p1 {
            0% { transform: rotate(0deg) translateX(55px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(55px) rotate(-360deg); }
          }
          @keyframes orbit-moon-p2 {
            0% { transform: rotate(120deg) translateX(70px) rotate(-120deg); }
            100% { transform: rotate(480deg) translateX(70px) rotate(-480deg); }
          }
          @keyframes orbit-moon-p3 {
            0% { transform: rotate(240deg) translateX(85px) rotate(-240deg); }
            100% { transform: rotate(600deg) translateX(85px) rotate(-600deg); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        `}} />

        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-900/90 px-5 py-4 border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center border border-yellow-400/20">
              <Sparkles className="text-yellow-400 w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Pembuat Benda Langit Kustom
              </h2>
              <p className="text-[10px] text-zinc-400 font-medium">Sistem Penjelajah Protoplanet Interaktif</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { SpaceAudio.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Container - Two Column Layout */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 border-b border-white/5">
          
          {/* LEFT PANEL: Interactive Live Preview & Telemetry Specs (5 cols) */}
          <div className="md:col-span-5 bg-zinc-950/40 p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 border-b md:border-b-0 md:border-r border-white/5 select-none md:overflow-y-auto">
            
            {/* Space Render Background Window */}
            <div className="relative w-full h-40 sm:h-48 md:h-auto md:aspect-square flex-shrink-0 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 rounded-xl overflow-hidden border border-white/5 flex flex-col items-center justify-center p-4">
              {/* Star fields dots simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-900/80 border border-white/10 text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                Visualizer 3D-CSS
              </div>

              {/* Orbit guide line indicators */}
              <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-white/5 pointer-events-none" />
              {hasRing && (
                <div className="absolute w-[220px] h-[80px] rounded-full border border-dashed border-orange-400/10 rotate-12 pointer-events-none" />
              )}

              {/* Mini moons orbiting (Conditional count visual rendering) */}
              {moonsCount >= 1 && (
                <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-zinc-300" style={{
                  animation: 'orbit-moon-p1 4s linear infinite',
                  marginLeft: '-4px',
                  marginTop: '-4px'
                }} />
              )}
              {moonsCount >= 2 && (
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-sky-200" style={{
                  animation: 'orbit-moon-p2 6s linear infinite',
                  marginLeft: '-3px',
                  marginTop: '-3px'
                }} />
              )}
              {moonsCount >= 3 && (
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-orange-150" style={{
                  animation: 'orbit-moon-p3 9.5s linear infinite',
                  marginLeft: '-3px',
                  marginTop: '-3px'
                }} />
              )}

              {/* The Planet Sphere */}
              <div 
                className="relative rounded-full transition-all duration-300 shadow-xl"
                style={{
                  width: `${Math.max(30, radius * 5.2)}px`,
                  height: `${Math.max(30, radius * 5.2)}px`,
                  background: activeColors.length > 2
                    ? `radial-gradient(circle at 35% 35%, ${activeColors[0]}, ${activeColors[1]} 45%, ${activeColors[2]} 90%)`
                    : `radial-gradient(circle at 35% 35%, ${activeColors[0]}, ${activeColors[1] || activeColors[0]})`,
                  boxShadow: `
                    inset -10px -10px 20px rgba(0,0,0,0.85), 
                    inset 6px 6px 14px rgba(255,255,255,0.2),
                    ${atmosphere !== 'none' ? `0 0 25px ${activeColors[1] || activeColors[0]}55` : '0 0 0 transparent'}
                  `
                }}
              >
                {/* Banded features for Gas Giants */}
                {type === 'planet' && radius > 11 && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-white/10 to-transparent [background-size:100%_12px] opacity-25 pointer-events-none" />
                )}

                {/* Ring System Overlay Drawing */}
                {hasRing && (
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-y-[4px] sm:border-y-[6px] border-orange-200/40 rounded-full select-none pointer-events-none"
                    style={{
                      width: `${radius * 12}px`,
                      height: `${radius * 3.8}px`,
                      transform: 'translate(-50%, -50%) rotate(18deg)',
                      boxShadow: '0 0 10px rgba(223, 201, 166, 0.15)'
                    }}
                  />
                )}

                {/* Comet Gaseous Tail Animation Overlay */}
                {type === 'comet' && (
                  <div 
                    className="absolute -left-[140px] top-1/2 -translate-y-1/2 w-[150px] origin-right pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, rgba(0,0,0,0), ${activeColors[1] || activeColors[0]}44, rgba(255,255,255,0.7))`,
                      height: `${radius * 2}px`,
                      borderRadius: '50% 10px 10px 50%',
                      filter: 'blur(3px)',
                      animation: 'comet-flicker 1.5s ease-in-out infinite alternate',
                    }}
                  />
                )}
              </div>

              {/* Dynamic Planet Indicator label */}
              <div className="absolute bottom-3 text-center">
                <p className="text-white text-xs font-black tracking-wide truncate max-w-[150px]">{name || 'Tanpa Nama'}</p>
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                  {type === 'comet' ? 'Komet Magnetis' : type === 'dwarf' ? 'Planet Kerdil' : radius > 11 ? 'Raksasa Gas' : 'Dunia Terestrial'}
                </p>
              </div>
            </div>

            {/* Spek Fisika Telemetry Section */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-1.5 flex items-center justify-between">
                <span>Telemetri Fisika</span>
                <Compass className="w-3.5 h-3.5 text-yellow-400 rotate-45" />
              </h3>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Massa Relatif (Bumi)</p>
                  <p className="font-mono text-white font-bold">{massRatio < 0.05 ? '< 0.01' : massRatio.toFixed(2)}x M⊕</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Suhu Permukaan</p>
                  <p className="font-mono text-white font-bold">{Math.round(270 / Math.sqrt(distance) - (atmosphere === 'co2' ? 70 : 160))}°C</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Gravitasi Permukaan</p>
                  <p className="font-mono text-white font-bold">{surfaceGravity.toFixed(2)} G</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Laju Bebas Escape</p>
                  <p className="font-mono text-white font-bold">{escapeVelocity.toFixed(1)} km/s</p>
                </div>
                <div className="col-span-2 border-t border-white/5 pt-2">
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Kelayakan Hunian (Habitability)</p>
                  <p className={`font-bold text-[11px] ${habitabilityColor}`}>{habitabilityStatus}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-zinc-500 font-bold uppercase text-[9px]">Kandungan Atmosfer</p>
                  <p className="text-zinc-300 font-medium text-[11px] truncate">{atmosphereLabels[atmosphere]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Form inputs & interactive modification controls (7 cols) */}
          <div className="md:col-span-7 p-4 sm:p-5 flex flex-col gap-5 sm:gap-6 md:overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 flex flex-col md:h-full justify-between">
              
              <div className="space-y-6">
                
                {/* Section A: Identity */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-extrabold flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-yellow-400" /> 1. Identifikasi Objek
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Nama Objek</span>
                      <input 
                        type="text" 
                        required
                        maxLength={25}
                        placeholder="Contoh: Karim Prime, Vulkan, Planet X"
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-yellow-400 placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Tipe Benda</span>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-900 border border-white/10 p-1 rounded-lg">
                        {(['planet', 'dwarf', 'comet'] as const).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { SpaceAudio.playClick(); setType(t); }}
                            className={`py-1 text-[10px] font-bold uppercase rounded transition-colors ${
                              type === t 
                                ? 'bg-yellow-400 text-zinc-950' 
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {t === 'planet' ? 'Planet' : t === 'dwarf' ? 'Kerdil' : 'Komet'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Materials & Composition */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-extrabold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-yellow-400" /> 2. Warna & Material Geologi
                    </label>
                    <button
                      type="button"
                      onClick={() => { SpaceAudio.playClick(); setUseCustomColors(!useCustomColors); }}
                      className="text-[10px] font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1"
                    >
                      {useCustomColors ? 'Gunakan Preset' : 'Kustom Warna'}
                    </button>
                  </div>

                  {useCustomColors ? (
                    <div className="bg-zinc-900/60 border border-white/5 p-3 rounded-xl grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-1 font-bold">
                        <span className="text-[9px] text-zinc-500 uppercase">Inti Core</span>
                        <input 
                          type="color" 
                          value={customColor1} 
                          onChange={e => setCustomColor1(e.target.value)}
                          className="w-12 h-8 rounded cursor-pointer bg-transparent border-0" 
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 font-bold">
                        <span className="text-[9px] text-zinc-500 uppercase">Mantel</span>
                        <input 
                          type="color" 
                          value={customColor2} 
                          onChange={e => setCustomColor2(e.target.value)}
                          className="w-12 h-8 rounded cursor-pointer bg-transparent border-0" 
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 font-bold">
                        <span className="text-[9px] text-zinc-500 uppercase">Atmosfer</span>
                        <input 
                          type="color" 
                          value={customColor3} 
                          onChange={e => setCustomColor3(e.target.value)}
                          className="w-12 h-8 rounded cursor-pointer bg-transparent border-0" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_MATERIALS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { SpaceAudio.playClick(); setSelectedPresetIdx(idx); }}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            selectedPresetIdx === idx 
                              ? 'border-yellow-400 bg-yellow-400/5 text-yellow-105' 
                              : 'border-white/5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-3.5 h-3.5 rounded-full shadow-inner relative flex overflow-hidden">
                              <span className="w-1/2 h-full" style={{ backgroundColor: preset.colors[0] }} />
                              <span className="w-1/2 h-full" style={{ backgroundColor: preset.colors[1] }} />
                            </div>
                            <span className="text-[10px] font-black tracking-wide truncate">{preset.name}</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 leading-snug line-clamp-1">{preset.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section C: Orbit Parameters */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-extrabold flex items-center gap-1.5">
                    <Orbit className="w-3.5 h-3.5 text-yellow-400" /> 3. Parameter Geometri Orbit
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-xl border border-white/5">
                    
                    {/* Semi-major Distance */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-zinc-500">Jarak Orbit (Matahari)</span>
                        <span className="text-yellow-400 font-mono">{distance.toFixed(1)} AU</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="15.0" step="0.1"
                        value={distance}
                        onChange={e => setDistance(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                        <span>Dekat (0.5 AU)</span>
                        <span>Sangat Jauh (15.0 AU)</span>
                      </div>
                    </div>

                    {/* Radius (Size) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-zinc-500">Diameter Benda</span>
                        <span className="text-yellow-400 font-mono">{radius} px</span>
                      </div>
                      <input 
                        type="range" min="3" max="22" step="1"
                        value={radius}
                        onChange={e => setRadius(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[9px] text-zinc-600 font-medium font-bold">
                        <span>Kurcaci (3px)</span>
                        <span>Super Gas (22px)</span>
                      </div>
                    </div>

                    {/* Eccentricity */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-zinc-500">Eksentrisitas (Ke-lonjongan)</span>
                        <span className="text-yellow-400 font-mono">{eccentricity.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" min="0.0" max="0.75" step="0.02"
                        value={eccentricity}
                        onChange={e => setEccentricity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                        <span>Bulat Sempurna</span>
                        <span>Elips Terjal</span>
                      </div>
                    </div>

                    {/* Speed Multiplier */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-zinc-500">Kecepatan Relatif</span>
                        <span className="text-yellow-400 font-mono">{speed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.2" max="3.5" step="0.1"
                        value={speed}
                        onChange={e => setSpeed(parseFloat(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                      />
                      <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                        <span>Stabil Inert'</span>
                        <span>Kilat Dinamis</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section D: Advanced / Atmosphere & Satellites */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-extrabold flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-yellow-400" /> 4. Konfigurasi Khusus & Satelit
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Ring Systems and Moons counts */}
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white font-bold">Cincin Planet (Rings)</p>
                          <p className="text-[9px] text-zinc-500 leading-snug font-medium">Es/Debu miring melingkari ekuator</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={hasRing} 
                            onChange={(e) => { SpaceAudio.playClick(); setHasRing(e.target.checked); }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-405" style={{
                            backgroundColor: hasRing ? '#facc15' : '#27272a'
                          }} />
                        </label>
                      </div>

                      <div className="border-t border-white/5 pt-3.5">
                        <p className="text-xs text-white font-bold mb-1.5">Jumlah Bulan Pengorbit</p>
                        <div className="grid grid-cols-4 gap-1.5 bg-zinc-900 border border-white/10 p-1 rounded-lg">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => { SpaceAudio.playClick(); setMoonsCount(num); }}
                              className={`py-1 text-xs font-bold rounded transition-colors ${
                                moonsCount === num 
                                  ? 'bg-yellow-404 text-zinc-950 bg-yellow-400' 
                                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Atmosphere Selector */}
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-2">
                      <p className="text-xs text-white font-bold">Komposisi Kandungan Atmosfer</p>
                      <p className="text-[9px] text-zinc-500 leading-normal font-medium mb-2">Mengatur gas dominan penahan suhu permukaan</p>
                      <select
                        value={atmosphere}
                        onChange={e => { SpaceAudio.playClick(); setAtmosphere(e.target.value as any); }}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-yellow-400"
                      >
                        <option value="none">Tanpa Atmosfer (Gersang)</option>
                        <option value="nitrogen">Nitrogen-Oksigen (Organik)</option>
                        <option value="co2">Karbondioksida Padat (Vulkanis)</option>
                        <option value="methane">Es Metana Gas (Hidrokarbon)</option>
                        <option value="hydrogen">Gas Hidrogen Helium (Kandungan Bintang)</option>
                      </select>
                    </div>

                  </div>
                </div>

              </div>

              {/* Submit & Reset Button */}
              <div className="pt-5 border-t border-white/5 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-zinc-950 hover:bg-yellow-500 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-yellow-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Orbit className="w-4 h-4" />
                  Ciptakan Benda Langit Baru
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

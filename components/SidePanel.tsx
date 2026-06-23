import React, { useState } from 'react';
import { PlanetConfig, MoonConfig } from '../types';
import { SpaceAudio } from '../audio';
import { 
  X, Info, Layers, Rocket, HelpCircle, Eye, EyeOff, Compass, Gauge, 
  Thermometer, RotateCcw, Calendar, Moon, Globe 
} from 'lucide-react';

interface SidePanelProps {
  planet: PlanetConfig | MoonConfig | null;
  onClose: () => void;
  onFollow: (planetName: string) => void;
  isFollowing: boolean;
}

// Educational Atmosphere & Mission data map for planets
const EXTRA_DATA: Record<string, { atmosphere: string; structure: string; missions: string[] }> = {
  "Matahari": {
    atmosphere: "Korona & Kromosfer (Plasma hidrogen dan helium yang sangat panas mencapai jutaan derajat).",
    structure: "Inti bintang (reaksi fusi), Zona Radiatif, Zona Konvektif, Fotosfer (permukaan cahaya).",
    missions: ["SOHO (1995)", "Parker Solar Probe (2018 - Mendekat dalam jarak ekstrem)", "Solar Orbiter (2020)"]
  },
  "Merkurius": {
    atmosphere: "Atmosfer sangat tipis (eksosfer) terdiri dari Oksigen, Natrium, Hidrogen, dan Helium.",
    structure: "Inti besi cair raksasa (sekitar 75% dari radius planet), mantel silikat tipis, dan kerak padat.",
    missions: ["Mariner 10 (1973 - Terbang lintas pertama)", "MESSENGER (2004 - Pengorbit pertama)", "BepiColombo (2018 - Menuju orbit)"]
  },
  "Venus": {
    atmosphere: "Sangat tebal! 96.5% Karbon Dioksida dan 3.5% Nitrogen. Awan korosif dari asam sulfat pekat.",
    structure: "Inti logam besi-nikel, mantel batu silikat elastis basah, kerak silikat tipis luar.",
    missions: ["Venera 7 (1970 - Pendaratan pertama)", "Magellan (1989 - Pemetaan radar global)", "Akatsuki (2010 - Pengorbit iklim)"]
  },
  "Bumi": {
    atmosphere: "Lapisan seimbang: 78% Nitrogen, 21% Oksigen, 0.9% Argon, dan jejak Karbon Dioksida.",
    structure: "Inti dalam padat, inti luar cair (pembangkit kutub magnet), mantel tebal bergolak, kerak lempeng tektonik.",
    missions: ["Sputnik 1 (1957 - Satelit pertama)", "ISS / Stasiun Luar Angkasa Internasional", "Teleskop Hubble (1990)"]
  },
  "Bulan": {
    atmosphere: "Hampir vakum mutlak; eksosfer sangat tipis tak berarti dari Helium dan Neon.",
    structure: "Inti logam kecil, mantel kaya magnesium, kerak debu regolit setebal 5-10 meter.",
    missions: ["Apollo 11 (1969 - Manusia pertama menapak Bulan)", "Chang'e 4 (2019 - Pendaratan pertama sisi jauh)", "Artemis I (2022)"]
  },
  "Mars": {
    atmosphere: "Atmosfer tipis: 95% Karbon Dioksida, 2.6% Nitrogen, 1.9% Argon, dengan sedikit uap air.",
    structure: "Inti besi padat sulfur, mantel silikat statis, kerak besi-oksida setebal 50 km.",
    missions: ["Viking 1 (1975 - Foto permukaan pertama)", "Curiosity Rover (2012)", "Perseverance Rover & Ingenuity Helicopter (2021)"]
  },
  "Jupiter": {
    atmosphere: "Atmosfer gas hidrogen (90%) dan helium (10%) tebal dengan sabuk badai aktif amonia cair.",
    structure: "Tidak ada permukaan padat. Inti batuan padat/es panas, dilapisi hidrogen metalik cair berkilau konduktif.",
    missions: ["Pioneer 10 (1973)", "Voyager 1 & 2 (1979 - Meneliti cincin & bulan es)", "Galileo (1995)", "Juno (2016)"]
  },
  "Saturnus": {
    atmosphere: "Komposisi: 96.3% Hidrogen molekuler, 3.25% Helium molekuler, diselingi awan amonia.",
    structure: "Inti silikat padat, dikelilingi hidrogen metalik cair tebal, menyelimuti mantel hidrogen helium gas.",
    missions: ["Pioneer 11 (1979)", "Voyager 1 (1980)", "Cassini-Huygens (2004 - Memasuki orbit dan meluncurkan robot Huygens ke Titan)"]
  },
  "Uranus": {
    atmosphere: "Atmosfer kaya es: 83% Hidrogen, 15% Helium, dan 2.3% Metana yang memberi warna biru-muda.",
    structure: "Inti batu kecil, mantel mantel es (air, amonia, metana beku), diselimuti selongsong uap gas.",
    missions: ["Voyager 2 (1986 - Satu-satunya wahana antariksa yang pernah mengunjungi Uranus)"]
  },
  "Neptunus": {
    atmosphere: "Unsur gas: 80% Hidrogen, 19% Helium, diselingi kristal metana pekat penghasil warna biru samudera.",
    structure: "Inti besi silikat padat tengah, dikelilingi mantel air, amonia super padat cair panas tekanan tinggi.",
    missions: ["Voyager 2 (1989 - Satu-satunya kunjungan flyby yang mendeteksi bintik badai gelap raksasa)"]
  },
  "Pluto": {
    atmosphere: "Atmosfer tipis beku nitrogen halus, metana gletser, dan karbon monoksida.",
    structure: "Inti batuan (70%), tertutup gletser es air tebal merata (30%), permukaan nitrogen beku.",
    missions: ["New Horizons (2015 - Terbang lintas bersejarah memberikan gambaran foto HD 'jantung' es Pluto)"]
  },
  "Komet Halley": {
    atmosphere: "Tidak memiliki atmosfer permanen. Koma gas air (H2O), metana (CH4), dan debu menyembur saat dekat surya.",
    structure: "Nukleus tumpukan puing berongga longgar dari debu vulkanik kasar, es air kering beku padat hitam legam.",
    missions: ["Giotto (1986 - Wahana ESA yang mendekati jarak 596 km dari inti komet)", "Vega 1 & 2 (1986)"]
  }
};

export const SidePanel: React.FC<SidePanelProps> = ({ planet, onClose, onFollow, isFollowing }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'structure' | 'missions'>('info');

  if (!planet) return null;

  const isMoon = planet.type === 'moon';
  const isDwarf = planet.type === 'dwarf';
  const isComet = planet.type === 'comet';

  // Get additional dynamic extra details
  const extra = EXTRA_DATA[planet.name] || {
    atmosphere: "Belum teridentifikasi rinci oleh pemindai.",
    structure: "Terdiri dari material batuan padat silikat dan mineral es antariksa.",
    missions: ["Sadelit pemantau bumi", "Survey teleskop antariksa bumi."]
  };

  const handleTabChange = (tab: 'info' | 'structure' | 'missions') => {
    SpaceAudio.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-zinc-950/95 sm:bg-black/85 backdrop-blur-xl border-l border-white/10 p-5 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
            {planet.name}
          </h2>
          <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            {isMoon ? 'Satelit Alami' : isDwarf ? 'Planet Kerdil' : isComet ? 'Komet Eksentrik' : 'Benda Langit Utama'}
          </div>
        </div>
        <button 
          onClick={() => { SpaceAudio.playClick(); onClose(); }}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs list (Responsive row style) */}
      {!isMoon && (
        <div className="flex bg-zinc-900/60 p-1 rounded-lg border border-white/5 mb-4 text-xs shrink-0 select-none">
          <button 
            onClick={() => handleTabChange('info')}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'info' ? 'bg-yellow-400 text-zinc-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Keterangan</span>
          </button>
          <button 
            onClick={() => handleTabChange('structure')}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'structure' ? 'bg-yellow-400 text-zinc-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Struktur</span>
          </button>
          <button 
            onClick={() => handleTabChange('missions')}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'missions' ? 'bg-yellow-400 text-zinc-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Misi</span>
          </button>
        </div>
      )}

      {/* Main Stats Scroll View */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar text-gray-300">
        
        {/* Visual Sphere Representation */}
        <div className="flex justify-center py-2 shrink-0">
          <div 
            className="w-24 h-24 rounded-full shadow-2xl relative flex items-center justify-center border border-white/5 transition-transform hover:scale-105 duration-300"
            style={{ 
              backgroundColor: planet.color,
              background: `radial-gradient(circle at 35% 35%, ${planet.color}, #000 95%)`,
              boxShadow: `0 0 30px ${planet.color}40`
            }}
          >
            {/* Draw Ring effect overlay if it is Saturn */}
            {planet.name === 'Saturnus' && (
              <div className="absolute w-[160%] h-4 border border-zinc-400/50 rounded-full rotate-12 scale-y-[0.35] bg-transparent opacity-80 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Tab 1: Info (Basic descriptions, standard stats, moons) */}
        {isMoon || activeTab === 'info' ? (
          <div className="space-y-5">
            {/* Base Bio Card */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 text-sm leading-relaxed text-justify relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <Globe className="w-12 h-12" />
              </div>
              <p className="relative z-10 text-gray-300 leading-relaxed text-justify">{planet.description}</p>
            </div>

            {/* Numeric Stats */}
            {!isMoon && (
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-zinc-900 pb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-yellow-400/80" /> Stat Fisika & Posisi
                </h3>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <StatBox label="Jarak Orbit" value={`${(planet as PlanetConfig).distance} AU`} icon={<Compass className="w-3.5 h-3.5 text-blue-400" />} />
                  <StatBox label="Diameter" value={(planet as PlanetConfig).diameter} icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />} />
                  <StatBox label="Suhu" value={(planet as PlanetConfig).temp} icon={<Thermometer className="w-3.5 h-3.5 text-red-400" />} />
                  <StatBox label="Panjang Hari" value={(planet as PlanetConfig).dayLength} icon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />} />
                  <StatBox label="Panjang Tahun" value={(planet as PlanetConfig).yearLength} icon={<Calendar className="w-3.5 h-3.5 text-orange-400" />} />
                  <StatBox label="Satelit" value={`${((planet as PlanetConfig).moons || []).length} Satelit`} icon={<Moon className="w-3.5 h-3.5 text-violet-400" />} />
                </div>
              </div>
            )}

            {/* Moons Breakdown list */}
            {!isMoon && (planet as PlanetConfig).moons && ((planet as PlanetConfig).moons || []).length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 font-bold border-b border-zinc-900 pb-1.5 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-yellow-400" /> Satelit Alami Utama
                </h3>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {((planet as PlanetConfig).moons || []).map((moon) => (
                    <div 
                      key={moon.name} 
                      onClick={() => {
                        SpaceAudio.playSelect();
                        // Allows tapping a moon inside list to inspect/focus it
                        onFollow(moon.name);
                      }}
                      className="bg-zinc-900/60 p-3 rounded-xl border border-white/5 hover:border-yellow-400/30 hover:bg-zinc-900 transition-all cursor-pointer flex gap-3 items-start group"
                    >
                      <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 mt-0.5 group-hover:scale-110 transition-transform" style={{ backgroundColor: moon.color }} />
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-gray-100 group-hover:text-yellow-400 transition-colors flex items-center gap-1">
                          {moon.name} <span className="text-[9px] font-mono font-medium text-gray-500">(Tap untuk Deteksi)</span>
                        </span>
                        <p className="text-[11px] text-gray-400 leading-relaxed text-justify">{moon.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Did You Know box */}
            {!isMoon && (
              <div className="bg-yellow-400/5 p-4 rounded-xl border border-yellow-400/10 relative overflow-hidden">
                <div className="flex gap-2.5 items-start">
                  <HelpCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-yellow-400 text-xs uppercase tracking-wide">Tahukah Anda?</h4>
                    <p className="text-xs text-yellow-100/90 leading-relaxed text-justify">{(planet as PlanetConfig).funFact}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Tab 2: Structure & Atmosphere */}
        {!isMoon && activeTab === 'structure' ? (
          <div className="space-y-5 animate-fade-in">
            {/* Atmosphere structure card */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                <Globe className="w-4 h-4" /> Komposisi Atmosfer
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                {extra.atmosphere}
              </p>
            </div>

            {/* Core structure card */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                <Layers className="w-4 h-4" /> Penyusun Struktur Geologi
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed text-justify">
                {extra.structure}
              </p>
            </div>

            {/* Orbit Eccentrity/Scientific statics */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-white/5 pb-1.5">
                Parameter Orbit & Mekanika Langit
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-900 py-1">
                  <span className="text-gray-500">Eksentrisitas Orbit:</span>
                  <span className="text-white font-bold">{(planet as PlanetConfig).eccentricity}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 py-1">
                  <span className="text-gray-500">Massa Relatif:</span>
                  <span className="text-white font-bold">{planet.name === 'Matahari' ? '1.989e30 kg' : 'Sesuai Jari-jari'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Kelajuan Orbit Rata-rata:</span>
                  <span className="text-white font-bold">{(10 * (planet as PlanetConfig).speed).toFixed(1)} km/s</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tab 3: Historic Space Missions */}
        {!isMoon && activeTab === 'missions' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <Rocket className="w-4 h-4 text-yellow-400 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Misi Luar Angkasa Utama</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Beberapa misi penjelajahan robotik utama milik manusia (NASA, ESA, Roscosmos, CNSA) yang mempelajari objek astronomi ini di luar angkasa:
              </p>

              <div className="space-y-3">
                {extra.missions.map((mission, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start bg-black/40 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] w-5 h-5 bg-yellow-400 text-zinc-950 font-bold font-mono rounded-full flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-200">{mission.split('(')[0].trim()}</p>
                      {mission.includes('(') && (
                        <p className="text-[11px] text-gray-500">{mission.slice(mission.indexOf('(') + 1, mission.indexOf(')'))}</p>
                      )}
                      {mission.includes('-') && (
                        <p className="text-[11px] text-gray-400 pt-1 text-justify leading-relaxed">{mission.slice(mission.indexOf('-') + 1).trim()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

      </div>

      {/* Primary Action Focus/Tracking Button at bottom */}
      {!isMoon && (
        <div className="mt-4 pt-3 border-t border-white/10 shrink-0">
          <button 
            onClick={() => {
              SpaceAudio.playSelect();
              onFollow(planet.name);
            }}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              isFollowing 
                ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' 
                : 'bg-white text-zinc-950 hover:bg-gray-200 shadow-lg'
            }`}
          >
            {isFollowing ? (
              <>
                <EyeOff className="w-4 h-4 shrink-0" />
                <span>Lepas Jejak Kamera</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 shrink-0" />
                <span>Ikuti Orbit Objek</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// Internal responsive statbox component
const StatBox = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-zinc-900/45 p-2.5 rounded-xl border border-white/5 flex gap-2 items-center">
    <div className="p-1 rounded-lg bg-white/5 text-gray-400">
      {icon}
    </div>
    <div className="space-y-0.5 leading-tight truncate">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">{label}</span>
      <span className="text-xs text-gray-100 font-bold block truncate">{value}</span>
    </div>
  </div>
);

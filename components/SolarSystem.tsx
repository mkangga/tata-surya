import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PLANETS, generateStars, generateAsteroids } from '../constants';
import { PlanetConfig, PlanetRuntimeState, MoonConfig } from '../types';
import { Tooltip } from './Tooltip';
import { Controls } from './Controls';
import { SidePanel } from './SidePanel';
import { Comparison } from './Comparison';
import { Quiz } from './Quiz';
import { CustomCreator } from './CustomCreator';
import { SpaceAudio } from '../audio';

// Scale Factors
const AU_PIXELS = 120; // Scale Distance
const PLANET_SCALE_FACTOR = 1; // Base scale for planet sizes

const SolarSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetConfig | MoonConfig | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetConfig | MoonConfig | null>(null); 
  const [following, setFollowing] = useState<string | null>(null); 
  
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [uiSpeed, setUiSpeed] = useState(1);
  const [uiZoom, setUiZoom] = useState(0.4); // Start zoomed out a bit more
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationDate, setSimulationDate] = useState(Date.now());
  
  // New Visualization States
  const [showHabitableZone, setShowHabitableZone] = useState(false);
  const [showComets, setShowComets] = useState(true);

  // Dialog Overlays
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Custom User-Created Planets
  const [customPlanets, setCustomPlanets] = useState<PlanetConfig[]>([]);
  const customPlanetsRuntime = useRef<PlanetRuntimeState[]>([]);

  // Simulation State
  const simulationState = useRef({
    scale: 0.4,
    speedMultiplier: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    dateMs: Date.now(),
    frameCount: 0,
  });

  // Touch State Refs
  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);
  const lastPinchDistRef = useRef<number | null>(null);

  const planetsRuntime = useRef<PlanetRuntimeState[]>(
    PLANETS.map(p => ({
      name: p.name,
      angle: Math.random() * Math.PI * 2,
      visualX: 0,
      visualY: 0,
      trail: [],
      moons: p.moons ? p.moons.map(() => ({ angle: Math.random() * Math.PI * 2 })) : []
    }))
  );

  const stars = useMemo(() => generateStars(1000), []);
  const asteroids = useMemo(() => generateAsteroids(500), []);

  useEffect(() => { simulationState.current.speedMultiplier = uiSpeed; }, [uiSpeed]);
  useEffect(() => { simulationState.current.scale = uiZoom; }, [uiZoom]);

  // Handle native wheel for smooth trackpad + mouse pinch-to-zoom without interrupting webpage behaviors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevents full-page browser pinch-to-zoom scaling behavior

      const scale = simulationState.current.scale;
      let factor = 1;

      if (e.ctrlKey) {
        // Laptop Trackpad Pinch Gesture
        factor = Math.exp(-e.deltaY * 0.015);
      } else {
        // Standard Mouse Scroll Wheel
        factor = Math.exp(-e.deltaY * 0.0015);
      }

      let newScale = scale * factor;
      newScale = Math.max(0.01, Math.min(newScale, 5));
      simulationState.current.scale = newScale;
      setUiZoom(newScale);
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // Handle Custom Planet Creation
  const handleCreateCustom = (newPlanet: PlanetConfig) => {
    setCustomPlanets(prev => {
      const updated = [...prev, newPlanet];
      
      // Sync runtime references without clearing existing positions
      customPlanetsRuntime.current = updated.map(cp => {
        const existing = customPlanetsRuntime.current.find(r => r.name === cp.name);
        if (existing) return existing;
        return {
          name: cp.name,
          angle: Math.random() * Math.PI * 2,
          visualX: 0,
          visualY: 0,
          trail: [],
          moons: cp.moons ? cp.moons.map(() => ({ angle: Math.random() * Math.PI * 2 })) : []
        };
      });
      return updated;
    });
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      
      const { scale, offsetX, offsetY, speedMultiplier } = simulationState.current;

      // --- PHYSICS UPDATE ---
      if (isPlaying) {
        simulationState.current.dateMs += (speedMultiplier * 86400 * 1000 * 0.1);
        simulationState.current.frameCount++;
        if (simulationState.current.frameCount % 12 === 0) {
          setSimulationDate(simulationState.current.dateMs);
        }

        // 1. Regular Presets physics
        planetsRuntime.current.forEach((rtPlanet, index) => {
          const config = PLANETS[index];
          if (config.type === 'planet' || config.type === 'dwarf' || config.type === 'comet') {
            const a = config.distance * AU_PIXELS;
            const e = config.eccentricity;
            const currentR = (a * (1 - e * e)) / (1 + e * Math.cos(rtPlanet.angle));
            const normalizedR = currentR / a; 
            const keplerSpeed = config.speed * (1 / (normalizedR * normalizedR)); 

            rtPlanet.angle += (keplerSpeed * 0.002) * speedMultiplier;
            
            const b = a * Math.sqrt(1 - e*e); // Semi-minor axis
            const c = a * e; // Sun focus center offset

            rtPlanet.visualX = a * Math.cos(rtPlanet.angle) - c; 
            rtPlanet.visualY = b * Math.sin(rtPlanet.angle);
            
            // Trail Logic
            if (rtPlanet.trail.length > 80) rtPlanet.trail.shift();
            const trailFrequency = config.type === 'comet' ? 5 : 20;
            if (Math.floor(Date.now() / trailFrequency) % 2 === 0) {
              rtPlanet.trail.push({ x: rtPlanet.visualX, y: rtPlanet.visualY });
            }

            // Update planet moons
            if (config.moons && rtPlanet.moons) {
              config.moons.forEach((moon, mIndex) => {
                rtPlanet.moons[mIndex].angle += (moon.speed * 0.02) * speedMultiplier;
              });
            }
          }
        });

        // 2. Custom User Planets physics
        customPlanetsRuntime.current.forEach((rtPlanet, index) => {
          const config = customPlanets[index];
          if (!config) return;

          const a = config.distance * AU_PIXELS;
          const e = config.eccentricity;
          const currentR = (a * (1 - e * e)) / (1 + e * Math.cos(rtPlanet.angle));
          const normalizedR = currentR / a; 
          const keplerSpeed = config.speed * (1 / (normalizedR * normalizedR)); 

          rtPlanet.angle += (keplerSpeed * 0.002) * speedMultiplier;
          
          const b = a * Math.sqrt(1 - e*e);
          const c = a * e;

          rtPlanet.visualX = a * Math.cos(rtPlanet.angle) - c; 
          rtPlanet.visualY = b * Math.sin(rtPlanet.angle);
          
          // Update custom planet moons
          if (config.moons && rtPlanet.moons) {
            config.moons.forEach((moon, mIndex) => {
              if (rtPlanet.moons[mIndex]) {
                rtPlanet.moons[mIndex].angle += (moon.speed * 0.02) * speedMultiplier;
              }
            });
          }

          // Custom trails
          if (rtPlanet.trail.length > 80) rtPlanet.trail.shift();
          if (Math.floor(Date.now() / 20) % 2 === 0) {
            rtPlanet.trail.push({ x: rtPlanet.visualX, y: rtPlanet.visualY });
          }
        });

        // 3. Asteroids movement
        asteroids.forEach(ast => {
          ast.angle += (ast.speed * 0.002) * speedMultiplier;
        });
      }

      // --- CAMERA UPDATE ---
      let currentOffsetX = offsetX;
      let currentOffsetY = offsetY;

      if (following) {
        let targetX = 0;
        let targetY = 0;
        let foundTarget = false;

        // Search in presets
        const targetPlanet = planetsRuntime.current.find(p => p.name === following);
        if (targetPlanet) {
          targetX = targetPlanet.visualX;
          targetY = targetPlanet.visualY;
          foundTarget = true;
        } else {
          // Search in moon targets
          for (let i = 0; i < PLANETS.length; i++) {
            const pConfig = PLANETS[i];
            const pRuntime = planetsRuntime.current[i];
            if (pConfig.moons && pRuntime.moons) {
              const mIndex = pConfig.moons.findIndex(m => m.name === following);
              if (mIndex !== -1) {
                const mConfig = pConfig.moons[mIndex];
                const mRuntime = pRuntime.moons[mIndex];
                targetX = pRuntime.visualX + Math.cos(mRuntime.angle) * mConfig.distance;
                targetY = pRuntime.visualY + Math.sin(mRuntime.angle) * mConfig.distance;
                foundTarget = true;
                break;
              }
            }
          }
        }

        // Search in custom planets
        if (!foundTarget) {
          const customTarget = customPlanetsRuntime.current.find(cp => cp.name === following);
          if (customTarget) {
            targetX = customTarget.visualX;
            targetY = customTarget.visualY;
            foundTarget = true;
          }
        }

        if (foundTarget) {
          simulationState.current.offsetX = -targetX * scale;
          simulationState.current.offsetY = -targetY * scale;
          currentOffsetX = -targetX * scale;
          currentOffsetY = -targetY * scale;
        }
      }

      // --- DRAWING ---
      
      // 1. Space Canvas Base
      ctx.fillStyle = '#020205'; 
      ctx.fillRect(0, 0, width, height);
      
      const nebulaGrad = ctx.createRadialGradient(width/2, height/2, width * 0.2, width/2, height/2, width * 1.5);
      nebulaGrad.addColorStop(0, '#090a12');
      nebulaGrad.addColorStop(1, '#000000');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx + currentOffsetX, cy + currentOffsetY);
      ctx.scale(scale, scale);

      // 2. Parallax Stars (Optimized: Using fast fillRect instead of costly arc paths)
      const parallaxScale = Math.max(0.1, 1/scale);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        const sz = star.size / scale;
        ctx.fillRect(star.x * parallaxScale - sz / 2, star.y * parallaxScale - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1.0;

      // 3. Asteroid Belt (Optimized: Standard for loop & flat rects without repetitive state changes)
      ctx.fillStyle = '#655a52';
      ctx.globalAlpha = 0.65;
      for (let i = 0; i < asteroids.length; i++) {
        const ast = asteroids[i];
        const r = ast.distance * AU_PIXELS;
        const x = Math.cos(ast.angle) * r;
        const y = Math.sin(ast.angle) * r;
        const sz = ast.size / scale;
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1.0;

      // 4. Orbit Lines & Habitable Zone
      if (showHabitableZone) {
        const hzInner = 0.95 * AU_PIXELS;
        const hzOuter = 1.37 * AU_PIXELS;
        ctx.beginPath();
        ctx.arc(0, 0, hzInner, 0, Math.PI * 2);
        ctx.arc(0, 0, hzOuter, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1.2 / scale;
        ctx.stroke();
      }

      ctx.lineWidth = Math.max(0.6, 0.6 / scale);
      
      // Draw Regular Orbits
      planetsRuntime.current.forEach((_, i) => {
        const config = PLANETS[i];
        if (config.type === 'comet' && !showComets) return;

        if (config.type === 'planet' || config.type === 'dwarf' || config.type === 'comet') {
          const a = config.distance * AU_PIXELS;
          const e = config.eccentricity;
          const b = a * Math.sqrt(1 - e*e);
          const c = a * e;
          ctx.beginPath();
          ctx.strokeStyle = config.type === 'comet' ? 'rgba(255,255,255,0.08)' : (config.type === 'dwarf' ? '#444' : '#2a2a34');
          if (config.type !== 'planet') ctx.setLineDash([4 / scale, 6 / scale]);
          else ctx.setLineDash([]);
          
          ctx.ellipse(-c, 0, a, b, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Custom Orbits
      customPlanets.forEach((config) => {
        const a = config.distance * AU_PIXELS;
        const e = config.eccentricity;
        const b = a * Math.sqrt(1 - e*e);
        const c = a * e;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(253, 184, 19, 0.25)'; // Glowing orbit for custom bodies
        ctx.setLineDash([5 / scale, 5 / scale]);
        ctx.ellipse(-c, 0, a, b, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 5. Sun Core & Corona glows
      const sun = PLANETS[0];
      const coronaGrad = ctx.createRadialGradient(0, 0, sun.radius, 0, 0, sun.radius * 4.5);
      coronaGrad.addColorStop(0, 'rgba(253, 184, 19, 0.45)');
      coronaGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.15)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sun.radius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing effect
      const pulseRadius = sun.radius + Math.sin(Date.now() / 400) * 0.8;
      const sunBodyGrad = ctx.createRadialGradient(0, 0, pulseRadius * 0.2, 0, 0, pulseRadius);
      sunBodyGrad.addColorStop(0, '#FFFFFF');
      sunBodyGrad.addColorStop(0.3, '#FDCA40');
      sunBodyGrad.addColorStop(0.8, '#F77F00');
      sunBodyGrad.addColorStop(1, '#D62828');
      ctx.fillStyle = sunBodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic solar flares & Loops of prominences extending outward
      ctx.save();
      ctx.strokeStyle = '#F77F00';
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.6;
      const timeSecs = Date.now() / 1200;
      for (let i = 0; i < 4; i++) {
        const loopAngle = (i * Math.PI) / 2 + Math.sin(timeSecs + i) * 0.15;
        const loopRadius = 8 + Math.sin(timeSecs * 2 + i) * 2.5;
        ctx.beginPath();
        ctx.arc(
          Math.cos(loopAngle) * (sun.radius - 2),
          Math.sin(loopAngle) * (sun.radius - 2),
          loopRadius,
          loopAngle - Math.PI / 3,
          loopAngle + Math.PI / 3
        );
        ctx.stroke();
      }
      ctx.restore();

      // 6. DRAW PLANETS (Presets and Customs)
      
      // Preset loop drawing
      planetsRuntime.current.forEach((rtPlanet, index) => {
        const config = PLANETS[index];
        if (config.type === 'star') return;
        if (config.type === 'comet' && !showComets) return;

        drawPlanetBody(ctx, config, rtPlanet, scale);
      });

      // Custom loop drawing
      customPlanetsRuntime.current.forEach((rtPlanet, index) => {
        const config = customPlanets[index];
        if (!config) return;

        drawPlanetBody(ctx, config, rtPlanet, scale);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    // Shared internal renderer to keep things incredibly modular
    const drawPlanetBody = (ctx: CanvasRenderingContext2D, config: PlanetConfig, rtPlanet: PlanetRuntimeState, scale: number) => {
      // Draw trails
      if (rtPlanet.trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = config.color;
        ctx.lineWidth = Math.max(1, 1/scale);
        ctx.globalAlpha = config.type === 'comet' ? 0.6 : 0.3;
        rtPlanet.trail.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      const x = rtPlanet.visualX;
      const y = rtPlanet.visualY;
      const radius = config.radius * PLANET_SCALE_FACTOR;
      const screenRadius = radius * scale;

      // LOD Optimization for zoomed-out states
      if (screenRadius < 4.2) {
        ctx.save();
        ctx.translate(x, y);

        // A. Simple solid planet circle
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // B. Simple 3D shading
        const shadowGrad = ctx.createLinearGradient(-radius/2, 0, radius/2, 0);
        shadowGrad.addColorStop(0, 'rgba(2,2,8,0.75)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // C. Simple ring for Saturn config
        if (config.hasRing) {
          ctx.save();
          ctx.rotate(Math.PI / 5.5);
          ctx.strokeStyle = '#dfcfa7';
          ctx.lineWidth = radius * 0.45;
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 2.1, radius * 0.55, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore(); // restore from translate(x,y)

        // D. Focus Selector Hover/Tapped rings
        if (selectedPlanet?.name === config.name || hoveredPlanet?.name === config.name) {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.8 / scale;
          ctx.beginPath();
          ctx.arc(x, y, radius + (4.5/scale), 0, Math.PI * 2);
          ctx.stroke();
        }

        // E. Responsive planet text labels
        if (scale < 0.25 || selectedPlanet?.name === config.name) {
          ctx.fillStyle = '#f3f4f6';
          ctx.font = `bold ${12.5/scale}px "Inter", sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 5;
          ctx.fillText(config.name, x, y - (radius + 13/scale));
          ctx.shadowBlur = 0;
        }

        return; // Complete simplified rendering!
      }

      // Comet tails
      if (config.type === 'comet') {
        const distToSun = Math.sqrt(x*x + y*y);
        const maxTailLen = 110;
        const tailStrength = Math.min(1.2, 450 / distToSun); 
        
        if (tailStrength > 0.1) {
          const angleFromSun = Math.atan2(y, x);
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angleFromSun);
          
          const tailGrad = ctx.createLinearGradient(0, 0, maxTailLen * tailStrength, 0);
          tailGrad.addColorStop(0, 'rgba(219, 239, 255, 0.8)');
          tailGrad.addColorStop(0.3, 'rgba(165, 203, 255, 0.4)');
          tailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(0, -radius);
          ctx.lineTo(maxTailLen * tailStrength, 0);
          ctx.lineTo(0, radius);
          ctx.fill();
          ctx.restore();
        }
      }

      ctx.save();
      ctx.translate(x, y);

      // Celestial atmosphere
      if (config.name === 'Bumi' || config.name === 'Venus' || config.colors.length >= 3) {
        const atmoGrad = ctx.createRadialGradient(0, 0, radius, 0, 0, radius * 1.35);
        atmoGrad.addColorStop(0, (config.colors[2] || config.color) + '77');
        atmoGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw planet body clipped to a circular sphere to paint beautiful real-world details
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();

      // 1. Base Layer (solid background or default color gradient)
      if (config.colors.length > 2) {
        const angle = Math.PI / 4;
        const planetCtx = ctx.createLinearGradient(
          -radius * Math.cos(angle), -radius * Math.sin(angle),
          radius * Math.cos(angle), radius * Math.sin(angle)
        );
        config.colors.forEach((col, idx) => {
          planetCtx.addColorStop(idx / (config.colors.length - 1), col);
        });
        ctx.fillStyle = planetCtx;
      } else {
        ctx.fillStyle = config.color;
      }
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

      // 2. Realistic Procedural Surface Features
      const nameLower = config.name.toLowerCase();
      if (nameLower === 'merkurius') {
        // Mercury: dry grey scorched crater world
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.beginPath();
        // Draw larger dark impact basins
        ctx.arc(-radius * 0.35, -radius * 0.15, radius * 0.28, 0, Math.PI * 2);
        ctx.arc(radius * 0.2, radius * 0.4, radius * 0.32, 0, Math.PI * 2);
        ctx.arc(radius * 0.4, -radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Draw craters with highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(-radius * 0.35, -radius * 0.15, radius * 0.22, 0, Math.PI * 2);
        ctx.arc(radius * 0.2, radius * 0.4, radius * 0.25, 0, Math.PI * 2);
        ctx.arc(-radius * 0.1, radius * 0.1, radius * 0.12, 0, Math.PI * 2);
        ctx.stroke();

        // White crater rays radiating from Tycho-like impact sites
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        const centerX = -radius * 0.35;
        const centerY = -radius * 0.15;
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(a) * radius * 0.85, centerY + Math.sin(a) * radius * 0.85);
        }
        ctx.stroke();
      } 
      else if (nameLower === 'venus') {
        // Venus: highly swirling acidic sulfuric cloud stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.2, -radius * 0.3, radius * 1.2, radius * 0.25, -Math.PI / 8, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.1, radius * 0.2, radius * 1.3, radius * 0.3, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(121, 80, 31, 0.14)';
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.05, radius * 1.15, radius * 0.35, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (nameLower === 'bumi' || nameLower === 'earth') {
        // Earth: ocean is blue base. Draw green/brown landmass continents
        ctx.fillStyle = '#2d844c'; // lush green vegetation
        ctx.beginPath();
        
        // Continent 1: Americas-like blobs
        ctx.arc(-radius * 0.4, -radius * 0.1, radius * 0.35, 0, Math.PI * 2);
        ctx.arc(-radius * 0.35, radius * 0.3, radius * 0.28, 0, Math.PI * 2);
        
        // Continent 2: Africa & Europe-like blobs
        ctx.arc(radius * 0.25, -radius * 0.3, radius * 0.31, 0, Math.PI * 2);
        ctx.arc(radius * 0.35, 0, radius * 0.28, 0, Math.PI * 2);
        
        // Continent 3: Eurasia & Australia-like blobs
        ctx.arc(radius * 0.45, radius * 0.45, radius * 0.22, 0, Math.PI * 2);
        ctx.arc(radius * 0.1, -radius * 0.45, radius * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Desert mountain areas (tan colors)
        ctx.fillStyle = '#c5a242';
        ctx.beginPath();
        ctx.arc(-radius * 0.4, -radius * 0.15, radius * 0.16, 0, Math.PI * 2);
        ctx.arc(radius * 0.25, -radius * 0.25, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Polar Ice Caps (pure bright white)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -radius, radius * 0.26, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, radius, radius * 0.17, Math.PI, 0);
        ctx.fill();

        // Fluffy swirling high-altitude methane/water clouds (semi-transparent white)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.1, -radius * 0.3, radius * 0.95, radius * 0.18, Math.PI / 12, 0, Math.PI * 2);
        ctx.ellipse(radius * 0.2, radius * 0.25, radius * 0.85, radius * 0.16, Math.PI / 10, 0, Math.PI * 2);
        ctx.ellipse(-radius * 0.3, radius * 0.1, radius * 0.55, radius * 0.14, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (nameLower === 'mars') {
        // Mars: dark basaltic sand desert plains
        ctx.fillStyle = 'rgba(68, 22, 11, 0.45)';
        ctx.beginPath();
        ctx.ellipse(radius * 0.1, radius * 0.12, radius * 0.55, radius * 0.32, Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(-radius * 0.42, -radius * 0.2, radius * 0.35, radius * 0.22, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright white polar ice cap (North Pole)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.95, radius * 0.25, 0, Math.PI);
        ctx.fill();
      } 
      else if (nameLower === 'ceres') {
        // Ceres: heavily cratered dwarf planet with bright salt spot
        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        ctx.beginPath();
        ctx.arc(-radius * 0.26, radius * 0.26, radius * 0.24, 0, Math.PI * 2);
        ctx.arc(radius * 0.35, -radius * 0.25, radius * 0.18, 0, Math.PI * 2);
        ctx.fill();
        
        // Occator Crater white bright spots (giant reflection points)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(radius * 0.15, -radius * 0.2, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } 
      else if (nameLower === 'jupiter') {
        // Jupiter: realistic horizontal multi-layered golden bands
        const stripeColors = [
          '#8a4f24', '#cda07d', '#e5dec1', '#aa7141', 
          '#e5dec1', '#c17f4a', '#dea887', '#8a4f24'
        ];
        const numStripes = 12;
        const sh = (radius * 2) / numStripes;
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = stripeColors[i % stripeColors.length];
          ctx.fillRect(-radius, -radius + i * sh, radius * 2, sh + 1);

          // Render subtle wavy storm disturbances inside bands
          if (i === 3 || i === 7) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.beginPath();
            ctx.ellipse(-radius * 0.25, -radius + (i + 0.5) * sh, radius * 0.32, sh * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Great Red Spot (Raksasa badai merah legendaris di selatan khatulistiwa)
        ctx.fillStyle = '#b73715'; 
        ctx.beginPath();
        ctx.ellipse(radius * 0.3, radius * 0.32, radius * 0.34, radius * 0.21, -Math.PI / 18, 0, Math.PI * 2);
        ctx.fill();

        // Light glowing safety storm border around the spot
        ctx.strokeStyle = 'rgba(255, 241, 195, 0.45)';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.ellipse(radius * 0.3, radius * 0.32, radius * 0.4, radius * 0.26, -Math.PI / 18, 0, Math.PI * 2);
        ctx.stroke();
      } 
      else if (nameLower === 'saturnus') {
        // Saturn: golden banded gaseous layer
        const saturnStripes = ['#eed090', '#f9e4b1', '#cbac6e', '#edd197', '#f4dfad', '#b59a5e'];
        const numStripes = 9;
        const sh = (radius * 2) / numStripes;
        for (let i = 0; i < numStripes; i++) {
          ctx.fillStyle = saturnStripes[i % saturnStripes.length];
          ctx.fillRect(-radius, -radius + i * sh, radius * 2, sh + 1);
        }
      } 
      else if (nameLower === 'uranus') {
        // Uranus: smooth aquamarine pale ice gas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.94, radius * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } 
      else if (nameLower === 'neptunus') {
        // Neptunus: royal deep cobalt blue with Great Dark Spot & bright high altitude clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

        // Great Dark Spot (Badai biru gelap pekat)
        ctx.fillStyle = '#142371';
        ctx.beginPath();
        ctx.ellipse(-radius * 0.25, -radius * 0.12, radius * 0.36, radius * 0.24, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Pure white high-altitude scooter clouds
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.52)';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(-radius * 0.2, radius * 0.16, radius * 0.85, -0.3, 0.3);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(195, 220, 255, 0.38)';
        ctx.beginPath();
        ctx.arc(radius * 0.1, -radius * 0.3, radius * 0.72, -0.4, 0.25);
        ctx.stroke();
      } 
      else if (nameLower === 'pluto') {
        // Pluto: Heart-shaped Tombaugh Regio
        ctx.fillStyle = 'rgba(105, 65, 48, 0.32)'; // organic dark terrains
        ctx.beginPath();
        ctx.arc(-radius * 0.42, radius * 0.2, radius * 0.35, 0, Math.PI * 2);
        ctx.arc(radius * 0.42, -radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Tombaugh Regio "Pluto's Heart"
        ctx.save();
        ctx.translate(radius * 0.18, radius * 0.2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillStyle = '#fdf0d9'; // whitish frozen nitrogen heart
        ctx.beginPath();
        const hs = radius * 0.37;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-hs, -hs, -hs * 1.5, hs / 3, 0, hs);
        ctx.bezierCurveTo(hs * 1.5, hs / 3, hs, -hs, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      else if (config.type === 'comet') {
        // Comet Nucleus: rocky dark ice comet core
        ctx.fillStyle = '#18212a';
        ctx.beginPath();
        ctx.arc(-radius * 0.1, -radius * 0.1, radius * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#556879';
        ctx.beginPath();
        ctx.arc(radius * 0.2, radius * 0.2, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      else {
        // Custom created planets & dynamic behaviors
        if (radius >= 11) {
          // Large radii preset: Render as banded gas giant
          const numStripes = 6;
          const sh = (radius * 2) / numStripes;
          for (let i = 0; i < numStripes; i++) {
            ctx.fillStyle = config.colors[i % config.colors.length] || config.color;
            ctx.globalAlpha = 0.88;
            ctx.fillRect(-radius, -radius + i * sh, radius * 2, sh + 1);
          }
          ctx.globalAlpha = 1.0;
        } else {
          // Smaller radii preset: Render Terrestrial planet continents
          ctx.fillStyle = config.colors[1] || 'rgba(0,0,0,0.2)';
          ctx.beginPath();
          ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.42, 0, Math.PI * 2);
          ctx.arc(radius * 0.38, radius * 0.3, radius * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore(); // Restore from clipping state safely

      // Ring Systems (Saturn & Uranus)
      if (config.hasRing) {
        ctx.save();
        ctx.rotate(Math.PI / 5.5); // beautiful Saturn 3D tilt

        // Nested concentric ellipses with gaps for Saturn's rings (Cassini Division)
        // A. Inner warm hazy ring C
        ctx.beginPath();
        ctx.strokeStyle = '#978675';
        ctx.lineWidth = radius * 0.16;
        ctx.globalAlpha = 0.35;
        ctx.ellipse(0, 0, radius * 1.45, radius * 0.41, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // B. Spectacular main Ring B (thick, bright cream)
        ctx.beginPath();
        ctx.strokeStyle = '#dfcfa7';
        ctx.lineWidth = radius * 0.55;
        ctx.globalAlpha = 0.86;
        ctx.ellipse(0, 0, radius * 1.85, radius * 0.52, 0, 0, Math.PI * 2);
        ctx.stroke();

        // C. Black gaps Cassini Division
        ctx.beginPath();
        ctx.strokeStyle = '#03030b';
        ctx.lineWidth = radius * 0.08;
        ctx.globalAlpha = 0.95;
        ctx.ellipse(0, 0, radius * 2.15, radius * 0.61, 0, 0, Math.PI * 2);
        ctx.stroke();

        // D. Medium outer Ring A (sandy gold)
        ctx.beginPath();
        ctx.strokeStyle = '#bfa982';
        ctx.lineWidth = radius * 0.25;
        ctx.globalAlpha = 0.65;
        ctx.ellipse(0, 0, radius * 2.32, radius * 0.66, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // Add thin vertical rings specialized for Uranus (Tilted Side Rotator)
      if (nameLower === 'uranus') {
        ctx.save();
        ctx.rotate(Math.PI / 2.1); // Vertical-like tilt of Uranus
        ctx.strokeStyle = 'rgba(209, 242, 245, 0.28)';
        ctx.lineWidth = radius * 0.05;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.85, radius * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3D Shadow Overlay shading (Shadow points away from Sun at 0,0)
      const angleToSun = Math.atan2(-y, -x);
      ctx.rotate(angleToSun);
      
      ctx.beginPath();
      ctx.fillStyle = 'rgba(2,2,8,0.78)';
      ctx.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2); 
      ctx.fill();

      const shadowGrad = ctx.createLinearGradient(-radius/2, 0, radius/2, 0);
      shadowGrad.addColorStop(0, 'rgba(2,2,8,0.85)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(-radius/2, -radius, radius, radius*2);

      ctx.restore();

      // Render orbiting moons (for Presets only)
      if (config.moons && rtPlanet.moons && scale > 0.15) {
        config.moons.forEach((moon, mIndex) => {
          const mAngle = rtPlanet.moons[mIndex].angle;
          const mx = x + Math.cos(mAngle) * moon.distance;
          const my = y + Math.sin(mAngle) * moon.distance;

          ctx.fillStyle = moon.color;
          ctx.beginPath();
          ctx.arc(mx, my, moon.radius, 0, Math.PI * 2);
          ctx.fill();
          
          const moonAngleToSun = Math.atan2(-my, -mx);
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(moonAngleToSun);
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.beginPath();
          ctx.arc(0, 0, moon.radius, Math.PI/2, -Math.PI/2);
          ctx.fill();
          ctx.restore();

          if (selectedPlanet?.name === moon.name || hoveredPlanet?.name === moon.name) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2 / scale;
            ctx.beginPath();
            ctx.arc(mx, my, moon.radius + (2.5/scale), 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      }

      // Focus Selector Hover/Tapped rings
      if (selectedPlanet?.name === config.name || hoveredPlanet?.name === config.name) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8 / scale;
        ctx.beginPath();
        ctx.arc(x, y, radius + (4.5/scale), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Responsive planet text labels
      if (scale < 0.25 || selectedPlanet?.name === config.name) {
        ctx.fillStyle = '#f3f4f6';
        ctx.font = `bold ${12.5/scale}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 5;
        ctx.fillText(config.name, x, y - (radius + 13/scale));
        ctx.shadowBlur = 0;
      }
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [stars, asteroids, isPlaying, following, selectedPlanet, hoveredPlanet, showHabitableZone, showComets, customPlanets]);

  // Universal Hit Detection (Mouse & Touch)
  const checkHit = (clientX: number, clientY: number): PlanetConfig | MoonConfig | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const width = canvas.width; 
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const { scale, offsetX, offsetY } = simulationState.current;

    // 1. Check Presets
    for (let i = 0; i < planetsRuntime.current.length; i++) {
      const rtP = planetsRuntime.current[i];
      const config = PLANETS[i];
      
      if (config.type === 'comet' && !showComets) continue;

      let pX = rtP.visualX;
      let pY = rtP.visualY;
      if (config.type === 'star') { pX = 0; pY = 0; }
      
      const screenX = cx + offsetX + pX * scale;
      const screenY = cy + offsetY + pY * scale;

      // Check Moons
      if (config.moons && rtP.moons && scale > 0.15) {
        for (let m = 0; m < config.moons.length; m++) {
          const moon = config.moons[m];
          const rtMoon = rtP.moons[m];
          const mx = pX + Math.cos(rtMoon.angle) * moon.distance;
          const my = pY + Math.sin(rtMoon.angle) * moon.distance;
          
          const screenMX = cx + offsetX + mx * scale;
          const screenMY = cy + offsetY + my * scale;
          
          const mHitRadius = Math.max(moon.radius * scale, 18); // Large tapping bubble for pads/phones
          const mDist = Math.hypot(mouseX - screenMX, mouseY - screenMY);

          if (mDist < mHitRadius) {
            return { ...moon, type: 'moon' as const };
          }
        }
      }

      const hitRadius = Math.max(config.radius * scale, 24); // Large tapping bubble for pads/phones
      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);

      if (dist < hitRadius) {
        return config;
      }
    }

    // 2. Check Customs
    for (let i = 0; i < customPlanetsRuntime.current.length; i++) {
      const rtCP = customPlanetsRuntime.current[i];
      const config = customPlanets[i];
      if (!config) continue;

      const screenX = cx + offsetX + rtCP.visualX * scale;
      const screenY = cy + offsetY + rtCP.visualY * scale;

      const hitRadius = Math.max(config.radius * scale, 24);
      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);

      if (dist < hitRadius) {
        return config;
      }
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    simulationState.current.isDragging = true;
    simulationState.current.lastMouseX = e.clientX;
    simulationState.current.lastMouseY = e.clientY;
    if (following) setFollowing(null);
  };

  const handleMouseUp = () => {
    simulationState.current.isDragging = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (simulationState.current.isDragging) {
      const dx = e.clientX - simulationState.current.lastMouseX;
      const dy = e.clientY - simulationState.current.lastMouseY;
      simulationState.current.offsetX += dx;
      simulationState.current.offsetY += dy;
      simulationState.current.lastMouseX = e.clientX;
      simulationState.current.lastMouseY = e.clientY;
      setHoveredPlanet(null);
      return;
    }

    const found = checkHit(e.clientX, e.clientY);
    setHoveredPlanet(found);
    if (found) {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = () => {
    if (hoveredPlanet) {
      SpaceAudio.playSelect();
      handleSelectPlanet(hoveredPlanet);
    }
  };

  // --- TOUCH HANDLERS (MOBILE GESTURES) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
      simulationState.current.isDragging = true;
      if (following) setFollowing(null);
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      lastPinchDistRef.current = dist;
      simulationState.current.isDragging = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && simulationState.current.isDragging && lastTouchRef.current) {
      const t = e.touches[0];
      const dx = t.clientX - lastTouchRef.current.x;
      const dy = t.clientY - lastTouchRef.current.y;
      
      simulationState.current.offsetX += dx;
      simulationState.current.offsetY += dy;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
    } 
    else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      
      if (lastPinchDistRef.current > 0) {
        const scaleFactor = dist / lastPinchDistRef.current;
        let newScale = simulationState.current.scale * scaleFactor;
        newScale = Math.max(0.01, Math.min(newScale, 5));
        
        simulationState.current.scale = newScale;
        setUiZoom(newScale);
      }
      lastPinchDistRef.current = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0 && touchStartRef.current) {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      
      // Tap detected when speed and drag distance is minimal
      if (Math.hypot(dx, dy) < 12 && dt < 300 && e.touches.length === 0) {
        const hit = checkHit(t.clientX, t.clientY);
        if (hit) {
          SpaceAudio.playSelect();
          handleSelectPlanet(hit);
        }
      }
    }
    
    if (e.touches.length === 0) {
      simulationState.current.isDragging = false;
      lastTouchRef.current = null;
      lastPinchDistRef.current = null;
    }
  };

  const handleSelectPlanet = (p: PlanetConfig | MoonConfig) => {
    setSelectedPlanet(p);
    setFollowing(p.name);
    
    const r = p.radius;
    let targetZoom = 1.0;
    
    if (r >= 10) {
      targetZoom = 0.85;
    } else {
      targetZoom = Math.min(Math.max(20 / r, 1.0), 3.5);
    }
    
    setUiZoom(targetZoom);
    simulationState.current.scale = targetZoom;
  };

  const handleSidePanelFollow = (name: string) => {
    if (following === name) {
      setFollowing(null);
    } else {
      let target: PlanetConfig | MoonConfig | undefined = PLANETS.find(p => p.name === name);
      if (!target) {
        target = customPlanets.find(cp => cp.name === name);
      }
      if (!target) {
        PLANETS.forEach(p => {
          if (p.moons) {
            const m = p.moons.find(m => m.name === name);
            if (m) target = m;
          }
        });
      }

      setFollowing(name);
      
      if (target) {
        const r = target.radius;
        let targetZoom = 1.0;
        if (r >= 10) {
          targetZoom = 0.85;
        } else {
          targetZoom = Math.min(Math.max(20 / r, 1.0), 3.5);
        }

        setUiZoom(targetZoom);
        simulationState.current.scale = targetZoom;
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* 1. Core Top overlays and Playbacks hud */}
      <Controls 
        speed={uiSpeed} setSpeed={setUiSpeed} 
        zoom={uiZoom} setZoom={setUiZoom} 
        isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)}
        date={simulationDate}
        onSelectPlanet={(p) => handleSelectPlanet(p)}
        following={following}
        showHabitableZone={showHabitableZone}
        setShowHabitableZone={setShowHabitableZone}
        showComets={showComets}
        setShowComets={setShowComets}
        
        // Modals triggers
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
      />
      
      {/* 2. Primary Space Rendering Surface */}
      <canvas
        ref={canvasRef}
        className={`block w-full h-full touch-none ${simulationState.current.isDragging ? 'cursor-grabbing' : hoveredPlanet ? 'cursor-pointer' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        
        /* Mobile Touch Gestures */
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* 3. High-tech contextual Tooltip on hover */}
      {!selectedPlanet && (
        <Tooltip x={cursorPos.x} y={cursorPos.y} planet={hoveredPlanet} />
      )}

      {/* 4. Details Information Side Panel with Missions and atmospheric contents */}
      <SidePanel 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)} 
        onFollow={handleSidePanelFollow}
        isFollowing={!!(selectedPlanet && following === selectedPlanet.name)}
      />

      {/* 5. SIDE-BY-SIDE COMPARE DIALOG */}
      <Comparison 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        customPlanets={customPlanets}
        onSelectObject={(obj) => handleSelectPlanet(obj)}
      />

      {/* 6. SPACE TRIVIA QUIZ MODAL */}
      <Quiz 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      {/* 7. CUSTOM PLANET CREATOR GENERATOR BACKGROUND */}
      <CustomCreator 
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreate={handleCreateCustom}
      />
    </div>
  );
};

export default SolarSystem;

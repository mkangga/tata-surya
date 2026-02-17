import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PLANETS, generateStars, generateAsteroids } from '../constants';
import { PlanetConfig, PlanetRuntimeState, MoonConfig } from '../types';
import { Tooltip } from './Tooltip';
import { Controls } from './Controls';
import { SidePanel } from './SidePanel';

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

  // Simulation State
  const simulationState = useRef({
    scale: 0.4,
    speedMultiplier: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  });

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
        setSimulationDate(d => d + (speedMultiplier * 86400 * 1000 * 0.1));

        planetsRuntime.current.forEach((rtPlanet, index) => {
          const config = PLANETS[index];
          if (config.type === 'planet') {
            // Kepler's Law approximation for speed
            rtPlanet.angle += (config.speed * 0.002) * speedMultiplier;
            
            // ELLIPTICAL ORBIT CALCULATION
            const a = config.distance * AU_PIXELS; // Semi-major axis
            const e = config.eccentricity;
            const b = a * Math.sqrt(1 - e*e); // Semi-minor axis
            const c = a * e; // Distance from center to focus (Sun)

            // Current position relative to Ellipse Center
            let ex = a * Math.cos(rtPlanet.angle);
            let ey = b * Math.sin(rtPlanet.angle);

            // Shift so Sun (focus) is at (0,0)
            rtPlanet.visualX = ex - c; 
            rtPlanet.visualY = ey;
            
            // Trail Logic
            if (rtPlanet.trail.length > 80) rtPlanet.trail.shift();
            if (Math.floor(Date.now() / 20) % 2 === 0) {
                rtPlanet.trail.push({ x: rtPlanet.visualX, y: rtPlanet.visualY });
            }

            // Update Moons
            if (config.moons && rtPlanet.moons) {
              config.moons.forEach((moon, mIndex) => {
                rtPlanet.moons[mIndex].angle += (moon.speed * 0.02) * speedMultiplier;
              });
            }
          }
        });

        asteroids.forEach(ast => {
            ast.angle += (ast.speed * 0.002) * speedMultiplier;
        });
      }

      // --- CAMERA UPDATE ---
      let currentOffsetX = offsetX;
      let currentOffsetY = offsetY;

      if (following) {
        const targetPlanet = planetsRuntime.current.find(p => p.name === following);
        if (targetPlanet) {
            simulationState.current.offsetX = -targetPlanet.visualX;
            simulationState.current.offsetY = -targetPlanet.visualY;
            currentOffsetX = -targetPlanet.visualX;
            currentOffsetY = -targetPlanet.visualY;
        }
      }

      // --- DRAWING ---
      
      // 1. Background (Space)
      ctx.fillStyle = '#020205'; 
      ctx.fillRect(0, 0, width, height);
      
      const nebulaGrad = ctx.createRadialGradient(width/2, height/2, width * 0.2, width/2, height/2, width * 1.5);
      nebulaGrad.addColorStop(0, '#0a0b14');
      nebulaGrad.addColorStop(1, '#000000');
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx + currentOffsetX, cy + currentOffsetY);
      ctx.scale(scale, scale);

      // 2. Stars
      const parallaxScale = Math.max(0.1, 1/scale);
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x * parallaxScale, star.y * parallaxScale, star.size / scale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. Asteroid Belt
      ctx.fillStyle = '#555';
      asteroids.forEach(ast => {
        const r = ast.distance * AU_PIXELS;
        const x = Math.cos(ast.angle) * r;
        const y = Math.sin(ast.angle) * r;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, (ast.size / scale), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 4. Orbit Lines
      ctx.lineWidth = Math.max(0.5, 0.5 / scale);
      ctx.strokeStyle = '#333';
      
      // Fix: Changed 'rtP' to '_' to ignore unused parameter
      planetsRuntime.current.forEach((_, i) => {
          const config = PLANETS[i];
          if (config.type === 'planet') {
            const a = config.distance * AU_PIXELS;
            const e = config.eccentricity;
            const b = a * Math.sqrt(1 - e*e);
            const c = a * e;
            ctx.beginPath();
            ctx.ellipse(-c, 0, a, b, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
      });

      // 5. Sun
      const sun = PLANETS[0];
      const coronaGrad = ctx.createRadialGradient(0, 0, sun.radius, 0, 0, sun.radius * 4);
      coronaGrad.addColorStop(0, 'rgba(255, 200, 0, 0.4)');
      coronaGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.1)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sun.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      const sunBodyGrad = ctx.createRadialGradient(0, 0, sun.radius * 0.2, 0, 0, sun.radius);
      sunBodyGrad.addColorStop(0, '#FFF');
      sunBodyGrad.addColorStop(0.4, '#FDB813');
      sunBodyGrad.addColorStop(1, '#FF8C00');
      ctx.fillStyle = sunBodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sun.radius, 0, Math.PI * 2);
      ctx.fill();

      // 6. Planets & Moons
      planetsRuntime.current.forEach((rtPlanet, index) => {
        const config = PLANETS[index];
        if (config.type !== 'planet') return;

        if (rtPlanet.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = config.color;
          ctx.lineWidth = Math.max(1, 1/scale);
          ctx.globalAlpha = 0.3;
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

        ctx.save();
        ctx.translate(x, y);

        if (config.name === 'Bumi' || config.name === 'Venus') {
            const atmoGrad = ctx.createRadialGradient(0, 0, radius, 0, 0, radius * 1.3);
            atmoGrad.addColorStop(0, (config.colors[2] || config.color) + '88');
            atmoGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = atmoGrad;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Fix: Removed unused surfGrad variable
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
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (config.hasRing) {
             ctx.save();
             ctx.rotate(Math.PI / 6);
             ctx.beginPath();
             ctx.strokeStyle = '#CDBA96';
             ctx.lineWidth = radius * 0.8;
             ctx.globalAlpha = 0.7;
             ctx.ellipse(0, 0, radius * 2.2, radius * 0.6, 0, 0, Math.PI * 2);
             ctx.stroke();
             
             ctx.beginPath();
             ctx.strokeStyle = '#000';
             ctx.lineWidth = radius * 0.1;
             ctx.globalAlpha = 0.5;
             ctx.ellipse(0, 0, radius * 1.8, radius * 0.5, 0, 0, Math.PI * 2);
             ctx.stroke();

             ctx.restore();
        }

        const angleToSun = Math.atan2(-y, -x);
        ctx.rotate(angleToSun);
        
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.arc(0, 0, radius, Math.PI / 2, -Math.PI / 2); 
        ctx.fill();

        const shadowGrad = ctx.createLinearGradient(-radius/2, 0, radius/2, 0);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.8)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(-radius/2, -radius, radius, radius*2);

        ctx.restore();

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
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1 / scale;
                ctx.beginPath();
                ctx.arc(mx, my, moon.radius + (2/scale), 0, Math.PI * 2);
                ctx.stroke();
            }
          });
        }

        if (selectedPlanet?.name === config.name || hoveredPlanet?.name === config.name) {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2 / scale;
          ctx.beginPath();
          ctx.arc(x, y, radius + (4/scale), 0, Math.PI * 2);
          ctx.stroke();
        }

        if (scale < 0.25 || selectedPlanet?.name === config.name) {
          ctx.fillStyle = '#EEE';
          ctx.font = `bold ${12/scale}px "Segoe UI", sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 4;
          ctx.fillText(config.name, x, y - (radius + 12/scale));
          ctx.shadowBlur = 0;
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [stars, asteroids, isPlaying, following, selectedPlanet, hoveredPlanet]);

  const handleWheel = (e: React.WheelEvent) => {
    const scale = simulationState.current.scale;
    const zoomSensitivity = 0.001 * scale; 
    let newScale = scale - e.deltaY * zoomSensitivity;
    newScale = Math.max(0.01, Math.min(newScale, 5));
    simulationState.current.scale = newScale;
    setUiZoom(newScale);
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

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const width = canvas.width; 
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const { scale, offsetX, offsetY } = simulationState.current;

    let found: PlanetConfig | MoonConfig | null = null;

    for (let i = 0; i < planetsRuntime.current.length; i++) {
      const rtP = planetsRuntime.current[i];
      const config = PLANETS[i];

      let pX = rtP.visualX;
      let pY = rtP.visualY;
      if (config.type === 'star') { pX = 0; pY = 0; }
      
      const screenX = cx + offsetX + pX * scale;
      const screenY = cy + offsetY + pY * scale;

      // Check Moons first
      if (config.moons && rtP.moons && scale > 0.15) {
         for(let m=0; m<config.moons.length; m++) {
             const moon = config.moons[m];
             const rtMoon = rtP.moons[m];
             const mx = pX + Math.cos(rtMoon.angle) * moon.distance;
             const my = pY + Math.sin(rtMoon.angle) * moon.distance;
             
             const screenMX = cx + offsetX + mx * scale;
             const screenMY = cy + offsetY + my * scale;
             
             const mHitRadius = Math.max(moon.radius * scale, 6); 
             const mDist = Math.hypot(mouseX - screenMX, mouseY - screenMY);

             if (mDist < mHitRadius) {
                 // FIX: Use 'as const' to satisfy TypeScript strict literal types
                 found = { ...moon, type: 'moon' as const };
                 break;
             }
         }
      }
      
      if (found) break;

      const hitRadius = Math.max(config.radius * scale, 12);
      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);

      if (dist < hitRadius) {
        found = config;
        break;
      }
    }

    setHoveredPlanet(found);
    if (found) {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = () => {
    if (hoveredPlanet) {
      setSelectedPlanet(hoveredPlanet);
      if (hoveredPlanet.type !== 'moon') {
        setFollowing(hoveredPlanet.name);
      }
    }
  };

  const handleSelectPlanet = (p: PlanetConfig) => {
    setSelectedPlanet(p);
    setFollowing(p.name);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <Controls 
        speed={uiSpeed} setSpeed={setUiSpeed} 
        zoom={uiZoom} setZoom={setUiZoom} 
        isPlaying={isPlaying} togglePlay={() => setIsPlaying(!isPlaying)}
        date={simulationDate}
        onSelectPlanet={handleSelectPlanet}
        following={following}
      />
      
      <canvas
        ref={canvasRef}
        className={`block w-full h-full ${simulationState.current.isDragging ? 'cursor-grabbing' : hoveredPlanet ? 'cursor-pointer' : 'cursor-default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {!selectedPlanet && (
        <Tooltip x={cursorPos.x} y={cursorPos.y} planet={hoveredPlanet} />
      )}

      <SidePanel 
        planet={selectedPlanet} 
        onClose={() => setSelectedPlanet(null)} 
        onFollow={(name) => setFollowing(name === following ? null : name)}
        isFollowing={!!(selectedPlanet && following === selectedPlanet.name)}
      />
    </div>
  );
};

export default SolarSystem;
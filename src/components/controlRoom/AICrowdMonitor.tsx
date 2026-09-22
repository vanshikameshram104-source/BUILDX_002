import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Video, Eye, ShieldCheck, Activity, Send, CheckCircle2,
  Sliders, Maximize2, Sparkles
} from 'lucide-react';

export const AICrowdMonitor: React.FC = () => {
  const { crowdZones, updateZoneDensity, approveCrowdRecommendation, darkMode } = useApp();

  const [selectedCamera, setSelectedCamera] = useState<'exit-b' | 'main-gate' | 'stage'>('exit-b');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isSimulatingSurge, setIsSimulatingSurge] = useState(false);
  const [fps, setFps] = useState(28);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Selected zone based on active camera
  const activeZone = crowdZones.find(z => 
    selectedCamera === 'exit-b' ? z.id === 'zone-exit-b' :
    selectedCamera === 'main-gate' ? z.id === 'zone-main-gate' :
    z.id === 'zone-stage-area'
  ) || crowdZones[0];

  // Animated YOLO bounding boxes simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    // Generate pseudo people points based on density
    const numPeople = Math.min(60, Math.floor(activeZone.density * 0.6));
    const people = Array.from({ length: numPeople }, (_, i) => ({
      x: 40 + Math.random() * (canvas.width - 80),
      y: 50 + Math.random() * (canvas.height - 100),
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      w: 18 + Math.random() * 8,
      h: 36 + Math.random() * 12,
      conf: (0.85 + Math.random() * 0.14).toFixed(2),
      id: `P-${100 + i}`
    }));

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Dark Surveillance Background Grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor tiles perspective lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Heatmap Density Blob Overlay
      if (showHeatmap && activeZone.density > 50) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 20,
          canvas.width / 2, canvas.height / 2, canvas.width / 2.5
        );
        if (activeZone.riskLevel === 'CRITICAL') {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
          gradient.addColorStop(0.6, 'rgba(34, 197, 94, 0.15)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Render Simulated People and YOLO Bounding Boxes
      people.forEach(p => {
        // Update positions with subtle jitter
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 30 || p.x > canvas.width - 50) p.vx *= -1;
        if (p.y < 40 || p.y > canvas.height - 60) p.vy *= -1;

        // Draw person silhouette
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + 6, 6, 0, Math.PI * 2); // head
        ctx.fill();
        ctx.fillRect(p.x + 3, p.y + 12, p.w - 6, p.h - 12); // body

        // YOLO Bounding Box
        if (showBoundingBoxes) {
          const isCrowded = activeZone.riskLevel === 'CRITICAL';
          ctx.strokeStyle = isCrowded ? '#ef4444' : '#10b981';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x, p.y, p.w, p.h);

          // YOLO Tag
          ctx.fillStyle = isCrowded ? '#ef4444' : '#10b981';
          ctx.fillRect(p.x, p.y - 12, 46, 12);
          ctx.fillStyle = '#ffffff';
          ctx.font = '8px monospace';
          ctx.fillText(`P ${p.conf}`, p.x + 2, p.y - 3);
        }
      });

      // 4. CCTV HUD Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, canvas.width, 32);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`CAM-04 // ${activeZone.zoneName.toUpperCase()}`, 12, 20);

      // Recording pill
      ctx.fillStyle = frameCount % 60 < 30 ? '#ef4444' : '#64748b';
      ctx.beginPath();
      ctx.arc(canvas.width - 90, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('REC 1080p', canvas.width - 80, 20);

      // Model metadata
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`YOLOv8x-Crowd | HeadCount: ~${activeZone.crowdCount} | FPS: ${fps}`, 12, canvas.height - 12);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeZone, showHeatmap, showBoundingBoxes, fps]);

  // Handle density manual slide
  const handleDensityChange = (newVal: number) => {
    updateZoneDensity(activeZone.id, newVal);
  };

  return (
    <div className="space-y-6">
      {/* Header & Predictive Risk Banner */}
      {activeZone.riskLevel === 'CRITICAL' && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-amber-950/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white tracking-wide">
                  ⚠️ CROWD RISK DETECTED
                </span>
                <span className="text-xs text-rose-300 font-mono">Surge Velocity: +18% / 5min</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {activeZone.zoneName} crowd density is increasing rapidly ({activeZone.density}%).
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeZone.recommendedAction || 'Recommended action: Redirect upcoming visitors to Exit C.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {activeZone.alertIssued ? (
              <span className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Diversion Broadcast Active
              </span>
            ) : (
              <button
                onClick={() => approveCrowdRecommendation(activeZone.id)}
                className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg hover:shadow-rose-600/30 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Approve & Broadcast Redirect to Exit C
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Dual Grid: Camera Feed + Zone Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 cols: AI Video Canvas & Controls */}
        <div className={`lg:col-span-7 rounded-xl border shadow-sm p-4 flex flex-col ${
          darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">AI Vision Stream (YOLOv8 + OpenCV Simulation)</h3>
            </div>
            
            {/* Camera Selectors */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-xs">
              <button
                onClick={() => setSelectedCamera('exit-b')}
                className={`px-2 py-1 rounded font-medium transition ${
                  selectedCamera === 'exit-b' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Exit B (East)
              </button>
              <button
                onClick={() => setSelectedCamera('main-gate')}
                className={`px-2 py-1 rounded font-medium transition ${
                  selectedCamera === 'main-gate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Main Gate
              </button>
              <button
                onClick={() => setSelectedCamera('stage')}
                className={`px-2 py-1 rounded font-medium transition ${
                  selectedCamera === 'stage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stage Plaza
              </button>
            </div>
          </div>

          {/* Canvas Video Stream */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={360} 
              className="w-full h-full object-cover"
            />

            {/* Live watermark badge */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              NEURAL INFERENCE ACTIVE
            </div>
          </div>

          {/* AI Detection Controls Toolbar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showBoundingBoxes} 
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>YOLO Bounding Boxes</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showHeatmap} 
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Thermal Density Heatmap</span>
              </label>
            </div>

            {/* Interactive Density Tweaker */}
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Simulate Density:</span>
              <input
                type="range"
                min="10"
                max="98"
                value={activeZone.density}
                onChange={(e) => handleDensityChange(parseInt(e.target.value, 10))}
                className="w-24 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-blue-400 font-bold w-8">{activeZone.density}%</span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Zone Cards & Density Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> All Event Zones (Deekshabhoomi)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Sensors: 6/6 Online</span>
          </div>

          <div className="space-y-3">
            {crowdZones.map(zone => {
              const isCrit = zone.riskLevel === 'CRITICAL';
              const isMod = zone.riskLevel === 'MODERATE';

              return (
                <div 
                  key={zone.id}
                  onClick={() => {
                    if (zone.id === 'zone-exit-b') setSelectedCamera('exit-b');
                    else if (zone.id === 'zone-main-gate') setSelectedCamera('main-gate');
                    else if (zone.id === 'zone-stage-area') setSelectedCamera('stage');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    activeZone.id === zone.id 
                      ? 'border-blue-500 ring-1 ring-blue-500/40 bg-slate-800/80' 
                      : darkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{zone.zoneName}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          isMod ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {zone.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{zone.description}</p>
                    </div>

                    <div className="text-right">
                      <span className={`text-lg font-mono font-bold ${
                        isCrit ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {zone.density}%
                      </span>
                      <div className="text-[10px] flex items-center justify-end gap-1 text-slate-400">
                        {zone.trendDirection === 'up' && <ArrowUpRight className="w-3 h-3 text-rose-400" />}
                        {zone.trendDirection === 'down' && <ArrowDownRight className="w-3 h-3 text-emerald-400" />}
                        <span>{zone.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Gauge */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Occupancy: {zone.crowdCount.toLocaleString()} people</span>
                      <span>Cap: {zone.capacity.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCrit ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                          isMod ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-emerald-500 to-green-600'
                        }`}
                        style={{ width: `${Math.min(100, zone.density)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

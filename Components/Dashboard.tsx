
import React, { useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { SystemMetrics } from '../types';

interface DashboardProps {
  metrics: SystemMetrics;
  children: React.ReactNode;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, children, isActive, videoRef }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-black">
      {/* 1. Camera Feed / Tactical Background */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {isActive ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover camera-feed opacity-60 grayscale-[0.3]"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(8,47,73,0.5)_0%,rgba(0,0,0,1)_100%)]"></div>
        )}
        {/* Iron Man Helmet HUD Grid Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* 2. HUD Corner Widgets */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 font-orbitron">
        {/* Top Left: Suit Status */}
        <div className="absolute top-6 left-6 hud-border p-3 rounded-lg flex flex-col gap-2 w-48">
          <div className="flex items-center justify-between text-[10px] text-cyan-400/80">
            <span>ARMOR INTEGRITY</span>
            <span className="text-white">98.4%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full">
            <div className="h-full bg-cyan-400 w-[98%] shadow-[0_0_8px_cyan]"></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-cyan-400/80 mt-1">
            <span>STABILIZERS</span>
            <span className="text-green-400">ACTIVE</span>
          </div>
        </div>

        {/* Top Right: Power/Core */}
        <div className="absolute top-6 right-6 hud-border p-3 rounded-lg flex flex-col gap-2 w-48 text-right">
          <div className="text-[10px] text-cyan-400/80">ARC REACTOR OUTPUT</div>
          <div className="text-xl text-white glow-cyan">3.4 GW</div>
          <div className="flex gap-1 justify-end">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-1 h-3 ${i < 8 ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
            ))}
          </div>
        </div>

        {/* Bottom Left: Diagnostics */}
        <div className="absolute bottom-6 left-6 hud-border p-3 rounded-lg w-64 text-[9px] font-mono text-cyan-600">
          <div className="text-cyan-400 mb-1 font-orbitron text-[10px]">DIAGNOSTIC_QUEUE</div>
          <div className="space-y-0.5 opacity-70">
            <div>> INIT_MARK_LXXXV_PROTOCOLS</div>
            <div>> ANALYZING_THERMAL_SIGNATURES...</div>
            <div>> RADAR_SWEEP_COMPLETE: 0_THREATS</div>
            <div>> NEURAL_LINK_LATENCY: 4ms</div>
            <div className="animate-pulse">> WAITING_FOR_COMMAND_SIR...</div>
          </div>
        </div>
      </div>

      {/* 3. Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-cyan-500/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center border-2 border-cyan-500 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            <span className="text-cyan-500 font-bold font-orbitron text-xl">J</span>
          </div>
          <div>
            <h1 className="text-xl font-black font-orbitron text-cyan-400 tracking-widest uppercase glow-cyan">JARVIS_LINK</h1>
            <p className="text-[8px] text-cyan-600 font-bold tracking-widest">TACTICAL DEFENSE INTERFACE v8.4.1</p>
          </div>
        </div>
        
        <div className="flex gap-8 items-center font-orbitron">
           <div className="text-right">
              <div className="text-[10px] text-cyan-600">MISSION CLOCK</div>
              <div className="text-cyan-400 text-sm tabular-nums">{metrics.uptime}</div>
           </div>
           <div className="text-right">
              <div className="text-[10px] text-cyan-600">CONNECTION</div>
              <div className="text-green-500 text-sm uppercase tracking-tighter">ENCRYPTED</div>
           </div>
        </div>
      </header>
      
      {/* 4. Main Interaction Area */}
      <main className="relative flex-1 p-8 grid grid-cols-12 gap-6 z-20 overflow-hidden">
        {/* Interaction Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col items-center justify-center h-full">
          {children}
        </div>
        
        {/* Log Sidebar (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col h-full overflow-hidden">
          {/* Terminal will be rendered via portal/children if needed, but for this layout we'll keep it simple */}
        </div>
      </main>
      
      {/* 5. Footer */}
      <footer className="relative z-20 px-8 py-2 bg-black/60 border-t border-cyan-500/10 flex justify-between items-center text-[9px] font-mono tracking-widest text-cyan-800">
        <div className="flex gap-6">
          <span>SECURE_ID: Stark-7-Gamma</span>
          <span className="text-cyan-600 animate-pulse">RECORDING_TACTICAL_FEED...</span>
        </div>
        <div className="flex gap-4">
          <span>LAT: 34.0259° N</span>
          <span>LONG: 118.7798° W</span>
          <span>ALT: 24,000 FT</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

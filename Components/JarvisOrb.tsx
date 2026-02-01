
import React from 'react';
import { JarvisStatus } from '../types';

interface JarvisOrbProps {
  status: JarvisStatus;
}

const JarvisOrb: React.FC<JarvisOrbProps> = ({ status }) => {
  const isSpeaking = status === JarvisStatus.SPEAKING;
  const isThinking = status === JarvisStatus.THINKING;

  return (
    <div className="relative flex items-center justify-center w-80 h-80 select-none">
      {/* HUD Geometry Rings */}
      <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
      <div className="absolute inset-4 border border-dashed border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
      
      {/* Tactical Compass Marks */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 90, 180, 270].map(deg => (
          <div key={deg} className="absolute w-1 h-4 bg-cyan-400/40" style={{ transform: `rotate(${deg}deg) translateY(-148px)` }}></div>
        ))}
      </div>

      {/* Main Reactive Rings */}
      <div className={`absolute w-[60%] h-[60%] border-4 border-cyan-500/30 rounded-full transition-transform duration-500 ${isSpeaking ? 'scale-110' : 'scale-100'}`}></div>
      <div className={`absolute w-[50%] h-[50%] border-2 border-blue-400/40 rounded-full animate-[spin_4s_ease-in-out_infinite] ${isThinking ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : ''}`}></div>
      
      {/* Inner Core */}
      <div className={`relative w-24 h-24 rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden
        ${status === JarvisStatus.LISTENING ? 'bg-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.8)]' : 
          status === JarvisStatus.THINKING ? 'bg-blue-600/40 shadow-[0_0_30px_rgba(37,99,235,0.6)]' :
          status === JarvisStatus.SPEAKING ? 'bg-white/40 shadow-[0_0_50px_rgba(255,255,255,0.7)]' : 
          status === JarvisStatus.ERROR ? 'bg-red-600/40 shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 
          'bg-cyan-900/20'}
      `}>
        {/* Core Detail */}
        <div className="w-12 h-12 border-2 border-white/20 rounded-full animate-pulse"></div>
        
        {/* Audio Reactive Waves (Mock) */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center gap-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-1 bg-white animate-bounce" style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}></div>
             ))}
          </div>
        )}
      </div>

      {/* Outer Rotating Segment */}
      <svg className="absolute w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1, 8" className="text-cyan-500/40" />
      </svg>
    </div>
  );
};

export default JarvisOrb;

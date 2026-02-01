
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 font-mono text-sm overflow-hidden border-glow">
      <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/20 pb-2">
        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        <span className="text-cyan-400/70 text-xs font-orbitron ml-2">SYSTEM_OUTPUT.LOG</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 leading-relaxed">
            <span className="text-cyan-600 shrink-0">[{log.timestamp}]</span>
            <span className={`shrink-0 font-bold ${
              log.source === 'JARVIS' ? 'text-cyan-400' : 
              log.source === 'USER' ? 'text-blue-400' : 'text-slate-500'
            }`}>
              {log.source}:
            </span>
            <span className="text-slate-300 break-words">{log.message}</span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;

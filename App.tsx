
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { JarvisStatus, LogEntry, SystemMetrics } from './types';
import { SYSTEM_INSTURCTION } from './constants';
import Dashboard from './components/Dashboard';
import JarvisOrb from './components/JarvisOrb';
import Terminal from './components/Terminal';
import { decodeAudioData, createPcmBlob, decode } from './services/audioService';

const FRAME_RATE = 1; // Send 1 frame per second to conserve tokens and bandwidth
const JPEG_QUALITY = 0.4;

const controlSystemFunction: FunctionDeclaration = {
  name: 'controlSystem',
  parameters: {
    type: Type.OBJECT,
    description: 'Control Stark Industries suit systems.',
    properties: {
      system: {
        type: Type.STRING,
        description: 'The system to control (e.g., "stabilizers", "thrusters", "arc_reactor", "optics")',
      },
      action: {
        type: Type.STRING,
        description: 'The action to perform (e.g., "optimize", "redirect_power", "engage", "calibrate")',
      },
      value: {
        type: Type.NUMBER,
        description: 'Intensity or level (0-100)',
      }
    },
    required: ['system', 'action'],
  },
};

const App: React.FC = () => {
  const [status, setStatus] = useState<JarvisStatus>(JarvisStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 12,
    memory: 45,
    network: 8,
    uptime: '00:00:00'
  });
  const [isActive, setIsActive] = useState(false);

  // Refs for audio/video
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);

  const addLog = useCallback((source: LogEntry['source'], message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      message
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  // Frame Capture Loop
  const startVisualFeed = useCallback((sessionPromise: Promise<any>) => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');

    frameIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !ctx) return;
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'image/jpeg' }
              });
            });
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', JPEG_QUALITY);
    }, 1000 / FRAME_RATE);
  }, []);

  const handleStartJarvis = async () => {
    try {
      addLog('SYSTEM', 'Initializing HUD link...');
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);

      // Access Mic AND Camera
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            addLog('SYSTEM', 'Tactical link online. Ready, Sir.');
            setStatus(JarvisStatus.IDLE);
            setIsActive(true);
            
            // Start Mic Stream
            const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Start Visual Feed
            startVisualFeed(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus(JarvisStatus.SPEAKING);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus(JarvisStatus.IDLE);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                addLog('SYSTEM', `EXEC_PROTOCOL: ${fc.name.toUpperCase()} -> ${JSON.stringify(fc.args)}`);
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Calibration complete, Sir." } }
                  });
                });
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus(JarvisStatus.IDLE);
            }

            if (message.serverContent?.inputTranscription) {
              addLog('USER', message.serverContent.inputTranscription.text);
              setStatus(JarvisStatus.THINKING);
            }
            if (message.serverContent?.outputTranscription) {
              addLog('JARVIS', message.serverContent.outputTranscription.text);
            }
          },
          onerror: (e) => {
            console.error('API Error:', e);
            setStatus(JarvisStatus.ERROR);
            addLog('SYSTEM', 'CRITICAL_PROTOCOL_FAILURE');
          },
          onclose: () => {
            setIsActive(false);
            setStatus(JarvisStatus.IDLE);
            addLog('SYSTEM', 'NEURAL_LINK_CLOSED');
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
          }
        },
        config: {
          systemInstruction: SYSTEM_INSTURCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          tools: [{ functionDeclarations: [controlSystemFunction] }],
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error('Init error:', error);
      addLog('SYSTEM', 'INITIALIZATION_FAILED');
      setStatus(JarvisStatus.ERROR);
    }
  };

  const handleStopJarvis = () => {
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close());
    }
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    setIsActive(false);
    setStatus(JarvisStatus.IDLE);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  return (
    <Dashboard metrics={metrics} isActive={isActive} videoRef={videoRef}>
      <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
        
        <JarvisOrb status={status} />
        
        <div className="flex flex-col items-center gap-6 mt-4 z-50">
           {!isActive ? (
             <button 
               onClick={handleStartJarvis}
               className="group relative px-12 py-5 bg-cyan-600/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 font-orbitron tracking-widest transition-all duration-300 backdrop-blur-md"
             >
               <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-10 rounded-full transition-opacity"></div>
               <span className="relative z-10 glitch-text">INITIALIZE_NEURAL_LINK</span>
               <div className="absolute -inset-1 border border-cyan-500/20 rounded-full animate-pulse"></div>
             </button>
           ) : (
             <button 
               onClick={handleStopJarvis}
               className="px-10 py-4 bg-red-600/10 hover:bg-red-500/20 border border-red-500/50 rounded-full text-red-500 font-orbitron tracking-widest transition-all backdrop-blur-md"
             >
               TERMINATE_LINK
             </button>
           )}
           
           <div className="text-cyan-400 font-orbitron text-[11px] tracking-widest uppercase flex items-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
             {status === JarvisStatus.IDLE && isActive ? 'System Standing By...' : 
              status === JarvisStatus.LISTENING ? 'Voice Stream Processing...' :
              status === JarvisStatus.THINKING ? 'Strategic Analysis...' :
              status === JarvisStatus.SPEAKING ? 'Relaying Intelligence...' :
              status === JarvisStatus.ERROR ? 'System Core Damaged' : 'Protocols Offline'}
           </div>
        </div>

        {/* Floating Terminal Widget (Moved to side but accessible) */}
        <div className="absolute bottom-6 right-6 w-80 h-48 pointer-events-auto">
          <Terminal logs={logs} />
        </div>
      </div>
    </Dashboard>
  );
};

export default App;

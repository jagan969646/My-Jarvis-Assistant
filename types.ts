
export enum JarvisStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'USER' | 'JARVIS';
  message: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  uptime: string;
}

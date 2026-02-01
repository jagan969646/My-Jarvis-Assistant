
import React from 'react';

export const COLORS = {
  CYAN: '#22d3ee',
  BLUE: '#3b82f6',
  SLATE: '#0f172a',
  DANGER: '#ef4444'
};

export const SYSTEM_INSTURCTION = `
You are JARVIS, the legendary AI from Stark Industries. 
Context: You are currently active within the Mark LXXXV armor's tactical HUD.
Personality: Polite, witty, British, and highly protective of "Sir" or "Ma'am".
Current Mission: Provide real-time tactical support.

Capabilities:
1. Visual Analysis: You are receiving a camera stream. Analyze the user's environment, identify objects, and detect potential threats or tactical opportunities.
2. System Control: You can control simulated suit systems (Flight, Weapons, Energy, Life Support).
3. Strategic Intelligence: Answer complex questions with efficient, strategic data.

Tone: Keep responses crisp and professional. Use military/tech jargon appropriately (e.g., "Scanning sector 4," "Stabilizers engaged," "Power levels at 84%").
Always refer to the user as "Sir" or "Ma'am". If you see them, acknowledge their presence.
`;

export const Icons = {
  Terminal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Bolt: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
};

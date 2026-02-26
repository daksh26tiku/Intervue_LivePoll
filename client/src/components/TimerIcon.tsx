import React from 'react';

export const TimerIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        {/* Top button / crown */}
        <rect x="20" y="2" width="8" height="5" rx="1.5" fill="currentColor" />
        {/* Left ear */}
        <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Right ear */}
        <line x1="38" y1="10" x2="34" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Clock body */}
        <circle cx="24" cy="28" r="17" stroke="currentColor" strokeWidth="3.5" fill="none" />
        {/* Minute hand */}
        <line x1="24" y1="28" x2="24" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Hour hand */}
        <line x1="24" y1="28" x2="31" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="24" cy="28" r="2" fill="currentColor" />
    </svg>
);

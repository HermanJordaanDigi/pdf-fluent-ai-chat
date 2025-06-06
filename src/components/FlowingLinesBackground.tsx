
import React from 'react';

const FlowingLinesBackground = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <style>
            {`
              @keyframes flow {
                0% { stroke-dashoffset: 1000; }
                100% { stroke-dashoffset: 0; }
              }
              .flowing-line {
                stroke-dasharray: 1000;
                animation: flow 15s linear infinite;
              }
              .delay-1 { animation-delay: -2s; }
              .delay-2 { animation-delay: -4s; }
              .delay-3 { animation-delay: -6s; }
              .delay-4 { animation-delay: -8s; }
              .delay-5 { animation-delay: -10s; }
            `}
          </style>
        </defs>
        
        {/* Portuguese Green Lines */}
        <path 
          className="flowing-line delay-1" 
          fill="none" 
          stroke="#006600" 
          strokeWidth="0.2" 
          d="M0,50 Q25,30 50,50 T100,50"
        />
        <path 
          className="flowing-line delay-3" 
          fill="none" 
          stroke="#006600" 
          strokeWidth="0.2" 
          d="M0,70 Q25,40 50,70 T100,70"
        />
        <path 
          className="flowing-line delay-5" 
          fill="none" 
          stroke="#006600" 
          strokeWidth="0.2" 
          d="M0,10 Q40,50 80,10 T100,10"
        />
        
        {/* Portuguese Red Lines */}
        <path 
          className="flowing-line delay-2" 
          fill="none" 
          stroke="#FF0000" 
          strokeWidth="0.2" 
          d="M0,30 Q25,60 50,30 T100,30"
        />
        <path 
          className="flowing-line delay-4" 
          fill="none" 
          stroke="#FF0000" 
          strokeWidth="0.2" 
          d="M0,20 Q25,50 50,20 T100,20"
        />
        <path 
          className="flowing-line delay-1" 
          fill="none" 
          stroke="#FF0000" 
          strokeWidth="0.2" 
          d="M0,90 Q40,50 80,90 T100,90"
        />
        
        {/* Portuguese Yellow/Gold Lines */}
        <path 
          className="flowing-line delay-3" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="0.2" 
          d="M0,80 Q25,60 50,80 T100,80"
        />
        <path 
          className="flowing-line delay-5" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="0.2" 
          d="M0,35 Q40,65 80,35 T100,35"
        />
        <path 
          className="flowing-line delay-2" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="0.2" 
          d="M0,65 Q40,35 80,65 T100,65"
        />
        <path 
          className="flowing-line delay-4" 
          fill="none" 
          stroke="#FFD700" 
          strokeWidth="0.2" 
          d="M0,40 Q40,70 80,40 T100,40"
        />
      </svg>
    </div>
  );
};

export default FlowingLinesBackground;


import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgNS = "http://www.w3.org/2000/svg";
    const N = 420;
    const SIZE = 500;
    const DOT_R = 1.2;
    const MARGIN = 10;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const MAX_R = CX - MARGIN - DOT_R;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const DUR = 2.2;

    // Clear any existing content
    const group = svg.querySelector('g');
    if (group) {
      group.innerHTML = '';
    }

    for (let i = 0; i < N; i++) {
      const frac = (i + 0.5) / N;
      const r = Math.sqrt(frac) * MAX_R;
      const theta = (i + 0.5) * GOLDEN;
      const x = CX + r * Math.cos(theta);
      const y = CY + r * Math.sin(theta);

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x.toString());
      circle.setAttribute("cy", y.toString());
      circle.setAttribute("r", DOT_R.toString());
      circle.setAttribute("fill", "#CCCCCC");
      circle.setAttribute("opacity", "0.3");

      const animR = document.createElementNS(svgNS, "animate");
      animR.setAttribute("attributeName", "r");
      animR.setAttribute("values", `${DOT_R * 0.7};${DOT_R * 1.4};${DOT_R * 0.7}`);
      animR.setAttribute("dur", `${DUR}s`);
      animR.setAttribute("begin", `${frac * DUR}s`);
      animR.setAttribute("repeatCount", "indefinite");
      animR.setAttribute("calcMode", "spline");
      animR.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");

      const animO = document.createElementNS(svgNS, "animate");
      animO.setAttribute("attributeName", "opacity");
      animO.setAttribute("values", "0.15;0.4;0.15");
      animO.setAttribute("dur", `${DUR}s`);
      animO.setAttribute("begin", `${frac * DUR}s`);
      animO.setAttribute("repeatCount", "indefinite");
      animO.setAttribute("calcMode", "spline");
      animO.setAttribute("keySplines", "0.4 0 0.6 1;0.4 0 0.6 1");

      circle.appendChild(animR);
      circle.appendChild(animO);
      
      if (group) {
        group.appendChild(circle);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 500 500"
          className="w-full h-full opacity-60"
          style={{
            willChange: 'transform',
            transform: 'scale(1.5)',
          }}
        >
          <g />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground;

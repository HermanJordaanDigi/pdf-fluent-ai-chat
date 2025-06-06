
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AuroraCometsBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    material: THREE.ShaderMaterial;
    animationId: number | null;
  } | null>(null);

  useEffect(() => {
    console.log('AuroraCometsBackground: Starting initialization...');
    
    if (!mountRef.current) {
      console.warn('AuroraCometsBackground: Mount ref not available');
      return;
    }

    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('AuroraCometsBackground: WebGL not supported, aurora comets effect disabled');
      return;
    }

    console.log('AuroraCometsBackground: WebGL supported, creating scene...');

    // Create Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Renderer with alpha for transparency
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    // Set transparent clear color
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    console.log('AuroraCometsBackground: Renderer created, adding to DOM...');
    
    // Add canvas to mount point
    mountRef.current.appendChild(renderer.domElement);

    // Improved shader material with better visibility
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        iTime: { value: 0.0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        float rand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p){
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x),
            u.y
          );
          return res * res;
        }

        float fbm(vec2 x) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
          for (int i = 0; i < 4; ++i) {
            v += a * noise(x);
            x = rot * x * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 fragCoord = gl_FragCoord.xy;
          vec2 uv = fragCoord / iResolution.xy;

          // Enhanced movement with more visible effects
          vec2 shake = vec2(
            sin(iTime * 1.5) * 0.01,
            cos(iTime * 2.0) * 0.01
          );

          vec2 p = ((fragCoord + shake * iResolution) - iResolution * 0.5) 
                   / iResolution.y 
                   * mat2(4.0, -3.0, 3.0, 4.0);

          vec4 o = vec4(0.0);

          float f = 1.5 + fbm(p + vec2(iTime * 3.0, 0.0)) * 0.8;

          // More visible comets with enhanced brightness
          for (float i = 0.0; i < 25.0; i += 1.0) {
            vec2 v = p 
                   + cos(i * i + (iTime + p.x * 0.1) * 0.03 + i * vec2(13.0, 11.0)) * 2.5
                   + vec2(sin(iTime * 2.0 + i) * 0.008, cos(iTime * 2.5 - i) * 0.008);

            float tailNoise = fbm(v + vec2(iTime * 0.8, i)) * 0.5; 

            // Brighter, more visible aurora colors
            vec4 auroraColors = vec4(
              0.3 + 0.7 * sin(i * 0.3 + iTime * 0.6),
              0.5 + 0.8 * cos(i * 0.4 + iTime * 0.7),
              0.8 + 0.5 * sin(i * 0.5 + iTime * 0.4),
              1.0
            );

            vec4 contribution = auroraColors 
                                * exp(sin(i * i + iTime * 1.2)) 
                                / length(max(v, vec2(v.x * f * 0.02, v.y * 1.2)));

            float visibility = smoothstep(0.0, 1.0, i / 25.0) * 0.8;
            o += contribution * (1.0 + tailNoise) * visibility;
          }

          // Enhanced brightness and contrast
          o = tanh(pow(o / 80.0, vec4(1.4)));
          o *= 4.0; // Significantly brighter

          // Ensure visibility against beige background
          o.rgb = max(o.rgb, vec3(0.05));

          gl_FragColor = vec4(o.rgb, o.a * 0.8);
        }
      `
    });

    console.log('AuroraCometsBackground: Shader material created');

    // Check for shader compilation errors
    const checkShaderErrors = () => {
      const gl = renderer.getContext();
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
        console.error('AuroraCometsBackground: WebGL error:', error);
      }
    };

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    console.log('AuroraCometsBackground: Mesh added to scene');

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      material,
      animationId: null
    };

    // Animation loop with error checking
    const animate = () => {
      if (!sceneRef.current) return;
      
      sceneRef.current.animationId = requestAnimationFrame(animate);
      sceneRef.current.material.uniforms.iTime.value += 0.016;
      
      try {
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
        checkShaderErrors();
      } catch (error) {
        console.error('AuroraCometsBackground: Render error:', error);
      }
    };

    // Handle resize
    const handleResize = () => {
      if (!sceneRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      sceneRef.current.renderer.setSize(width, height);
      sceneRef.current.material.uniforms.iResolution.value.set(width, height);
      
      console.log(`AuroraCometsBackground: Resized to ${width}x${height}`);
    };

    window.addEventListener('resize', handleResize);
    
    console.log('AuroraCometsBackground: Starting animation loop...');
    animate();

    // Cleanup function
    return () => {
      console.log('AuroraCometsBackground: Cleaning up...');
      
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current) {
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        
        // Cleanup Three.js resources
        sceneRef.current.material.dispose();
        sceneRef.current.renderer.dispose();
        
        // Remove canvas from DOM
        if (mountRef.current && sceneRef.current.renderer.domElement.parentNode) {
          mountRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
};

export default AuroraCometsBackground;

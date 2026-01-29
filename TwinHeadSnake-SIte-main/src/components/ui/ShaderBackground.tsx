"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

interface ShaderBackgroundProps {
  className?: string;
}


function ShaderBackgroundInner({ className = "" }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    
    const initShader = async () => {
      const { 
        Camera, 
        Scene, 
        PlaneGeometry, 
        ShaderMaterial, 
        Mesh, 
        WebGLRenderer, 
        Vector2 
      } = await import("three");

      const container = containerRef.current;
      if (!container) return;

      const vertexShader = `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;
        
        uniform vec2 resolution;
        uniform float time;
        
        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          
          float oscillation = sin(time * 0.3) * 2.0;
          float t = oscillation * 0.08;
          
          float lineWidth = 0.002;
          vec3 color = vec3(0.0);
          
          for(int j = 0; j < 3; j++) {
            for(int i = 0; i < 8; i++) {
              float phase = t - 0.008 * float(j) + float(i) * 0.008;
              float ring = fract(phase) * 4.0 - length(uv) + mod(uv.x + uv.y, 0.15);
              float intensity = lineWidth * float(i * i) / abs(ring);
              
              if(j == 0) color[j] += intensity * 0.0;
              if(j == 1) color[j] += intensity * 1.0;
              if(j == 2) color[j] += intensity * 0.67;
            }
          }
          
          float vignette = 1.0 - smoothstep(0.3, 1.5, length(uv));
          color *= vignette * 0.7;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const camera = new Camera();
      camera.position.z = 1;

      const scene = new Scene();
      const geometry = new PlaneGeometry(2, 2);

      const uniforms = {
        time: { value: 0.0 },
        resolution: { value: new Vector2() },
      };

      const material = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      const mesh = new Mesh(geometry, material);
      scene.add(mesh);

      const renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
      };

      onResize();
      window.addEventListener("resize", onResize, { passive: true });

      let animationId = 0;
      let lastTime = 0;
      const targetFPS = 20;
      const frameInterval = 1000 / targetFPS;
      
      const animate = (currentTime: number) => {
        animationId = requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;
        
        lastTime = currentTime - (deltaTime % frameInterval);
        uniforms.time.value += 0.016;
        renderer.render(scene, camera);
      };

      animate(0);

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(animationId);
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    initShader().then(c => { cleanup = c; });

    return () => {
      if (cleanup) cleanup();
    };
  }, [mounted]);

  
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{ overflow: "hidden" }}
    >
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/50 via-transparent to-[#050508]/80" />
    </div>
  );
}


export const ShaderBackground = dynamic(
  () => Promise.resolve(ShaderBackgroundInner),
  { ssr: false }
);

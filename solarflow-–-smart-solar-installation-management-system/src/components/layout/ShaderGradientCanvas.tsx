import React, { useEffect, useRef } from 'react';

/**
 * Static, non-distracting subtle shader gradient inspiration
 * Colors: color1="#f5f3ef", color2="#dbba95", color3="#292724"
 */
export const ShaderGradientCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    // Static rendering of the smooth mesh gradient
    const grad1 = ctx.createLinearGradient(0, 0, width, height);
    grad1.addColorStop(0, '#f5f3ef');
    grad1.addColorStop(0.45, '#dbba95');
    grad1.addColorStop(1, '#292724');

    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial light overlay for depth (brightness 1.2, reflection 0.1)
    const rad = ctx.createRadialGradient(width * 0.25, height * 0.2, 10, width * 0.3, height * 0.3, width * 0.9);
    rad.addColorStop(0, 'rgba(245, 243, 239, 0.45)');
    rad.addColorStop(0.6, 'rgba(219, 186, 149, 0.25)');
    rad.addColorStop(1, 'rgba(41, 39, 36, 0.6)');

    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, width, height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply ${className}`}
      aria-hidden="true"
    />
  );
};

import { useEffect, useRef } from 'react';

/**
 * DynamicBackground - Vector Flow Field
 * 
 * Generates an aerodynamic wind-tunnel streamline particle flow:
 * - Fluid mathematical curves following trigonometric vector forces
 * - Adapts cleanly across Dark (Obsidian Studio) and Light (Warm Archival Paper)
 * - Lightweight, battery-friendly canvas rendering (60-80 particles)
 * - Replaces generic graph-paper grids with bespoke generative motion
 */
export default function DynamicBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let W = 0;
        let H = 0;

        const resize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        };

        resize();
        window.addEventListener('resize', resize);

        // Particle pool for streamlines
        const particleCount = Math.min(Math.floor(window.innerWidth / 18), 75);
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * (window.innerWidth || 1200),
            y: Math.random() * (window.innerHeight || 800),
            speed: 0.5 + Math.random() * 0.9,
            length: 16 + Math.random() * 24,
            alpha: 0.12 + Math.random() * 0.32,
            isAccent: Math.random() < 0.22 // ~22% vermilion accents
        }));

        const render = () => {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

            // Subtle trail fade for fluid motion blur
            ctx.fillStyle = isDark ? 'rgba(11, 11, 12, 0.18)' : 'rgba(247, 245, 240, 0.18)';
            ctx.fillRect(0, 0, W, H);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Curving vector angle driven by spatial trigonometry
                const angle = Math.sin(p.y * 0.0035 + p.x * 0.001) * 0.75 + 0.18;
                const vx = Math.cos(angle) * p.speed;
                const vy = Math.sin(angle) * p.speed;

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - vx * p.length, p.y - vy * p.length);

                if (p.isAccent) {
                    ctx.strokeStyle = isDark
                        ? `rgba(249, 115, 66, ${p.alpha * 0.95})`
                        : `rgba(232, 93, 44, ${p.alpha * 0.85})`;
                    ctx.lineWidth = 1.2;
                } else {
                    ctx.strokeStyle = isDark
                        ? `rgba(255, 255, 255, ${p.alpha * 0.45})`
                        : `rgba(20, 20, 24, ${p.alpha * 0.22})`;
                    ctx.lineWidth = 0.9;
                }

                ctx.stroke();

                p.x += vx * 1.5;
                p.y += vy * 1.5;

                // Screen wrapping with buffer
                if (p.x > W + 60) p.x = -30;
                if (p.y > H + 60) p.y = -30;
                if (p.y < -60) p.y = H + 30;
                if (p.x < -60) p.x = W + 30;
            }

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="thoughtos-vector-flow-field"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                backgroundColor: 'var(--bg-primary)',
                transition: 'background-color 0.3s ease'
            }}
        />
    );
}

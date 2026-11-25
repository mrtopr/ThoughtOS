import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * SignatureFooter - Bespoke Signal Glitch Signature
 * 
 * Features:
 * - Subdued, architectural opacity (default 0.28 / 28%)
 * - Subtle chromatic aberration glitch (Vermilion + Cyan channels)
 * - Canvas micro-scanline atmospheric backdrop
 * - Adapts cleanly across Light (Warm Archival Paper) & Dark (Obsidian Studio)
 * - Fully portable to any future project
 */
export default function SignatureFooter({
  name = 'SACHIN',
  project = 'THOUGHTOS',
  opacity = 0.28,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = 0;
    let H = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W;
      canvas.height = H;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      // Gentle occasional scanline
      if (Math.random() < 0.035) {
        const y = Math.random() * H;
        ctx.fillStyle = `rgba(180, 180, 190, ${opacity * 0.08})`;
        ctx.fillRect(0, y, W, 1);
      }
      // Rare vermilion tick
      if (Math.random() < 0.012) {
        const y = Math.random() * H;
        const x = Math.random() * (W - 80);
        ctx.fillStyle = `rgba(232, 93, 44, ${opacity * 0.35})`;
        ctx.fillRect(x, y, 50, 1);
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [opacity]);

  return (
    <footer
      className={`thoughtos-signature ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        padding: '60px 24px 44px',
        marginTop: '60px',
        borderTop: '1px solid var(--glass-border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />

      {/* Monumental Glitch Name */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'inline-block',
          textAlign: 'center'
        }}
      >
        <span
          className="sig-glitch-text"
          data-text={name}
          style={{
            '--sig-opacity': opacity,
            fontFamily: "'Syne', -apple-system, sans-serif",
            fontSize: 'clamp(36px, 7vw, 68px)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            textTransform: 'uppercase',
            display: 'inline-block',
            position: 'relative',
            color: `rgba(var(--sig-text-rgb, 140, 140, 145), ${opacity})`
          }}
        >
          {name}
        </span>
      </div>

      {/* Architectural Meta Line */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
          marginTop: '14px',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: `rgba(var(--sig-text-rgb, 140, 140, 145), ${opacity * 1.1})`
        }}
      >
        <span>{project}</span>
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 8px var(--accent-primary)'
          }}
        />
        <span>BUILT BY {name}</span>
      </div>

      <style>{`
        :root {
          --sig-text-rgb: 25, 25, 27;
        }
        [data-theme="dark"] {
          --sig-text-rgb: 245, 245, 248;
        }

        .sig-glitch-text {
          animation: sig-jitter-main 6.5s infinite ease-in-out;
        }

        .sig-glitch-text::before,
        .sig-glitch-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Vermilion chromatic aberration */
        .sig-glitch-text::before {
          color: var(--accent-primary);
          opacity: 0;
          animation: sig-aberration-red 6.5s infinite;
        }

        /* Cyan/blue chromatic aberration */
        .sig-glitch-text::after {
          color: #00d2ff;
          opacity: 0;
          animation: sig-aberration-cyan 6.5s infinite;
        }

        @keyframes sig-jitter-main {
          0%, 88%, 100% {
            transform: none;
          }
          89% {
            transform: skewX(-2deg) translateX(1px);
          }
          91% {
            transform: skewX(1.8deg) translateX(-1.2px);
          }
          92.5% {
            transform: skewX(-0.8deg) translateX(0.6px);
          }
          94% {
            transform: none;
          }
          96% {
            transform: translateY(0.8px);
          }
          97.5% {
            transform: none;
          }
        }

        @keyframes sig-aberration-red {
          0%, 88%, 100% {
            opacity: 0;
            transform: none;
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
          }
          89% {
            opacity: calc(var(--sig-opacity, 0.28) * 1.25);
            transform: translateX(-3px) translateY(-1px);
            clip-path: polygon(0 18%, 100% 18%, 100% 44%, 0 44%);
          }
          91% {
            opacity: calc(var(--sig-opacity, 0.28) * 1.25);
            transform: translateX(2.5px) translateY(1px);
            clip-path: polygon(0 58%, 100% 58%, 100% 82%, 0 82%);
          }
          93% {
            opacity: 0;
            transform: none;
          }
          96.5% {
            opacity: calc(var(--sig-opacity, 0.28) * 0.9);
            transform: translateX(-2px);
            clip-path: polygon(0 75%, 100% 75%, 100% 90%, 0 90%);
          }
          98% {
            opacity: 0;
          }
        }

        @keyframes sig-aberration-cyan {
          0%, 88%, 100% {
            opacity: 0;
            transform: none;
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
          }
          89% {
            opacity: calc(var(--sig-opacity, 0.28) * 1.1);
            transform: translateX(3px) translateY(1px);
            clip-path: polygon(0 35%, 100% 35%, 100% 55%, 0 55%);
          }
          91.5% {
            opacity: calc(var(--sig-opacity, 0.28) * 1.1);
            transform: translateX(-2.5px) translateY(-1px);
            clip-path: polygon(0 12%, 100% 12%, 100% 32%, 0 32%);
          }
          93% {
            opacity: 0;
            transform: none;
          }
          97% {
            opacity: calc(var(--sig-opacity, 0.28) * 0.8);
            transform: translateX(2px);
            clip-path: polygon(0 62%, 100% 62%, 100% 80%, 0 80%);
          }
          98.5% {
            opacity: 0;
          }
        }
      `}</style>
    </footer>
  );
}

SignatureFooter.propTypes = {
  name: PropTypes.string,
  project: PropTypes.string,
  opacity: PropTypes.number,
  className: PropTypes.string
};

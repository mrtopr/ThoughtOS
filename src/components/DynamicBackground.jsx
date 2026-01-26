import { useEffect, useState } from 'react';

export default function DynamicBackground() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: 'hidden',
            background: 'var(--bg-primary)',
            transition: 'background 0.5s ease'
        }}>
            {/* Animated Blobs */}
            <div className="blob blob-1" style={{
                position: 'absolute',
                top: '-10%',
                right: '10%',
                width: '600px',
                height: '600px',
                background: 'var(--blob-1)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                animation: 'float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            <div className="blob blob-2" style={{
                position: 'absolute',
                bottom: '10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                background: 'var(--blob-2)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                animation: 'float 25s infinite alternate-reverse cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            <div className="blob blob-3" style={{
                position: 'absolute',
                top: '40%',
                left: '30%',
                width: '400px',
                height: '400px',
                background: 'var(--blob-3)',
                filter: 'blur(100px)',
                borderRadius: '50%',
                animation: 'float 22s infinite alternate cubic-bezier(0.4, 0, 0.2, 1)',
                animationDelay: '-5s'
            }} />

            <style>{`
                @keyframes float {
                    0% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(10%, 15%) scale(1.1);
                    }
                    66% {
                        transform: translate(-15%, 10%) scale(0.9);
                    }
                    100% {
                        transform: translate(5%, -10%) scale(1);
                    }
                }
                
                .blob {
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

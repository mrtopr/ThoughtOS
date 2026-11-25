export default function DynamicBackground() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden',
                backgroundColor: 'var(--bg-primary)',
                backgroundImage: `
                    linear-gradient(to right, var(--border-color) 1px, transparent 1px),
                    linear-gradient(to bottom, var(--border-color) 1px, transparent 1px),
                    radial-gradient(var(--border-color-strong) 1px, transparent 1px)
                `,
                backgroundSize: '72px 72px, 72px 72px, 18px 18px',
                backgroundPosition: '0 0, 0 0, 9px 9px',
                opacity: 0.7,
                transition: 'background-color 0.3s ease',
                pointerEvents: 'none'
            }}
        />
    );
}

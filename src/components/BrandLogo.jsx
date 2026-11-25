export default function BrandLogo({ size = 34 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="ThoughtOS Logo"
            style={{ flexShrink: 0, display: 'block' }}
        >
            <rect
                x="1.5"
                y="1.5"
                width="33"
                height="33"
                rx="9"
                fill="var(--text-primary)"
            />
            {/* Architectural T + Orbit Frame */}
            <path
                d="M10.5 12H25.5M18 12V25.5"
                stroke="var(--bg-secondary)"
                strokeWidth="2.4"
                strokeLinecap="square"
            />
            {/* Vermilion Signal Node */}
            <circle
                cx="24.5"
                cy="23.5"
                r="3.2"
                fill="var(--accent-primary)"
            />
        </svg>
    );
}

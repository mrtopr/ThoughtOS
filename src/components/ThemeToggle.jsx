import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { themeStorage } from '../utils/storage';

export default function ThemeToggle({
    className = '',
    duration = 400,
    animationType = 'circle-spread'
}) {
    const [isDark, setIsDark] = useState(false);
    const buttonRef = useRef(null);

    useEffect(() => {
        const updateTheme = () => {
            const currentTheme = themeStorage.get();
            setIsDark(currentTheme === 'dark');
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return;

        const newTheme = isDark ? 'light' : 'dark';

        // Check if View Transition API is supported
        if (!document.startViewTransition) {
            // Fallback for browsers without View Transition API
            setIsDark(!isDark);
            document.documentElement.setAttribute('data-theme', newTheme);
            themeStorage.set(newTheme);
            return;
        }

        // Wait for the DOM update to complete within the View Transition
        await document.startViewTransition(() => {
            flushSync(() => {
                setIsDark(!isDark);
                document.documentElement.setAttribute('data-theme', newTheme);
                themeStorage.set(newTheme);
            });
        }).ready;

        // Calculate coordinates and dimensions for spatial animations
        const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        );
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Implement animation based on type
        switch (animationType) {
            case 'circle-spread':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${maxRadius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'round-morph':
                document.documentElement.animate(
                    [
                        { opacity: 0, transform: 'scale(0.8) rotate(5deg)' },
                        { opacity: 1, transform: 'scale(1) rotate(0deg)' },
                    ],
                    {
                        duration: duration * 1.2,
                        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'swipe-left':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `inset(0 0 0 ${viewportWidth}px)`,
                            `inset(0 0 0 0)`,
                        ],
                    },
                    {
                        duration,
                        easing: 'cubic-bezier(0.2, 0, 0, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'swipe-up':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `inset(${viewportHeight}px 0 0 0)`,
                            `inset(0 0 0 0)`,
                        ],
                    },
                    {
                        duration,
                        easing: 'cubic-bezier(0.2, 0, 0, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'diag-down-right':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `polygon(0 0, 0 0, 0 0, 0 0)`,
                            `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                        ],
                    },
                    {
                        duration: duration * 1.5,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'fade-in-out':
                document.documentElement.animate(
                    {
                        opacity: [0, 1],
                    },
                    {
                        duration: duration * 0.5,
                        easing: 'ease-in-out',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'shrink-grow':
                document.documentElement.animate(
                    [
                        { transform: 'scale(0.9)', opacity: 0 },
                        { transform: 'scale(1)', opacity: 1 },
                    ],
                    {
                        duration: duration * 1.2,
                        easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                document.documentElement.animate(
                    [
                        { transform: 'scale(1)', opacity: 1 },
                        { transform: 'scale(1.05)', opacity: 0 },
                    ],
                    {
                        duration: duration * 1.2,
                        easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
                        pseudoElement: '::view-transition-old(root)',
                    }
                );
                break;

            case 'swipe-right':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `inset(0 ${viewportWidth}px 0 0)`,
                            `inset(0 0 0 0)`,
                        ],
                    },
                    {
                        duration,
                        easing: 'cubic-bezier(0.2, 0, 0, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'swipe-down':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `inset(0 0 ${viewportHeight}px 0)`,
                            `inset(0 0 0 0)`,
                        ],
                    },
                    {
                        duration,
                        easing: 'cubic-bezier(0.2, 0, 0, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'wave-ripple':
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0% at 50% 50%)`,
                            `circle(${maxRadius}px at 50% 50%)`,
                        ],
                    },
                    {
                        duration: duration * 1.5,
                        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                );
                break;

            case 'none':
            default:
                break;
        }
    }, [isDark, duration, animationType]);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                style={{
                    color: 'var(--text-primary)',
                    transition: 'color 0.3s ease, transform 0.2s ease'
                }}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {animationType !== 'flip-x-in' && (
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            ::view-transition-old(root),
                            ::view-transition-new(root) {
                                animation: none;
                                mix-blend-mode: normal;
                            }
                            
                            .theme-toggle:hover {
                                color: var(--accent-primary);
                                transform: scale(1.1);
                            }
                        `,
                    }}
                />
            )}
        </>
    );
}

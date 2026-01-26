import { createRoot } from 'react-dom/client';

let confirmContainer = null;
let confirmRoot = null;

export const customConfirm = (message) => {
    return new Promise((resolve) => {
        if (!confirmContainer) {
            confirmContainer = document.createElement('div');
            confirmContainer.id = 'confirm-container';
            document.body.appendChild(confirmContainer);
            confirmRoot = createRoot(confirmContainer);
        }

        const handleClose = (result) => {
            if (confirmRoot) {
                confirmRoot.unmount();
            }
            if (confirmContainer) {
                document.body.removeChild(confirmContainer);
                confirmContainer = null;
                confirmRoot = null;
            }
            resolve(result);
        };

        confirmRoot.render(
            <div
                className="modal-overlay animate-fade-in"
                onClick={() => handleClose(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}
            >
                <div
                    className="animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '20px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: 'white',
                            margin: '0 auto 1.5rem'
                        }}
                    >
                        ⚠
                    </div>

                    {/* Message */}
                    <p
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            textAlign: 'center',
                            marginBottom: '2rem',
                            lineHeight: '1.5'
                        }}
                    >
                        {message}
                    </p>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => handleClose(false)}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleClose(true)}
                            className="btn"
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white'
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    });
};

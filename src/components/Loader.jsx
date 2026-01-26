import '../styles/loader.css';

export default function Loader({ message = 'Loading...', size = 'medium' }) {
    const sizeMap = {
        small: '40px',
        medium: '60px',
        large: '80px'
    };

    return (
        <div className="loader-container">
            <div className="loader-wrapper">
                {/* Modern animated loader */}
                <div className="modern-loader" style={{
                    width: sizeMap[size],
                    height: sizeMap[size]
                }}>
                    <div className="loader-circle loader-circle-1"></div>
                    <div className="loader-circle loader-circle-2"></div>
                    <div className="loader-circle loader-circle-3"></div>
                    <div className="loader-dot"></div>
                </div>

                {/* Loading message */}
                {message && (
                    <p className="loader-message">{message}</p>
                )}
            </div>
        </div>
    );
}

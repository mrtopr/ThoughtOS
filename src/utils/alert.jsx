import { createRoot } from 'react-dom/client';
import Alert from '../components/Alert';

let alertContainer = null;
let alertRoot = null;

const initAlertContainer = () => {
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        document.body.appendChild(alertContainer);
        alertRoot = createRoot(alertContainer);
    }
};

const showAlert = (type, message, duration = 3000) => {
    initAlertContainer();

    const handleClose = () => {
        if (alertRoot) {
            alertRoot.unmount();
            alertContainer = null;
            alertRoot = null;
        }
    };

    alertRoot.render(
        <Alert
            type={type}
            message={message}
            onClose={handleClose}
            duration={duration}
        />
    );
};

export const alert = {
    success: (message, duration) => showAlert('success', message, duration),
    error: (message, duration) => showAlert('error', message, duration),
    warning: (message, duration) => showAlert('warning', message, duration),
    info: (message, duration) => showAlert('info', message, duration)
};

// Replace window.alert with custom alert
window.customAlert = alert;

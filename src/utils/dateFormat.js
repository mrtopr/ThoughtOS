// Format date to readable string
export const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        // If today, show time
        if (diffInDays === 0) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // If yesterday
        if (diffInDays === 1) {
            return 'Yesterday';
        }

        // If within a week
        if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        }

        // Otherwise show full date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// Format date with time
export const formatDateTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (dateString) => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffInMs = now - date;

        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        if (weeks < 4) return `${weeks}w ago`;
        if (months < 12) return `${months}mo ago`;
        return `${years}y ago`;
    } catch (error) {
        console.error('Error getting relative time:', error);
        return '';
    }
};

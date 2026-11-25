// Local-first profile management (no login or signup required)

const LOCAL_PROFILE_KEY = 'thoughtos_local_profile';

const DEFAULT_PROFILE = {
    id: 'local-user',
    email: 'Local Storage',
    user_metadata: {
        display_name: 'Creator',
        bio: 'Personal Knowledge & Productivity OS'
    }
};

const getLocalProfile = () => {
    try {
        const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (!raw) {
            localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(DEFAULT_PROFILE));
            return DEFAULT_PROFILE;
        }
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_PROFILE,
            ...parsed,
            user_metadata: {
                ...DEFAULT_PROFILE.user_metadata,
                ...(parsed.user_metadata || {})
            }
        };
    } catch (error) {
        console.error('Error reading local profile:', error);
        return DEFAULT_PROFILE;
    }
};

export const getCurrentUser = async () => {
    return getLocalProfile();
};

export const getSession = async () => {
    return { user: getLocalProfile() };
};

export const isAuthenticated = async () => {
    return true;
};

export const getUserProfile = async () => {
    return getLocalProfile();
};

export const updateUserProfile = async (updatesOrUserId, maybeUpdates) => {
    try {
        // Support both updateUserProfile({ display_name, bio }) and updateUserProfile(userId, updates)
        const updates = typeof updatesOrUserId === 'string' ? (maybeUpdates || {}) : (updatesOrUserId || {});
        const current = getLocalProfile();

        const updated = {
            ...current,
            user_metadata: {
                ...current.user_metadata,
                ...(updates.display_name !== undefined ? { display_name: updates.display_name } : {}),
                ...(updates.bio !== undefined ? { bio: updates.bio } : {})
            }
        };

        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updated }));
        return { success: true, data: updated };
    } catch (error) {
        console.error('Update user profile error:', error);
        return { success: false, error: error.message };
    }
};

// Optional/no-op stubs for compatibility
export const signUp = async () => ({ success: true, user: getLocalProfile() });
export const resendConfirmationEmail = async () => ({ success: true });
export const signIn = async () => ({ success: true, user: getLocalProfile(), session: { user: getLocalProfile() } });
export const signInWithGoogle = async () => ({ success: true, user: getLocalProfile() });
export const sendPasswordResetEmail = async () => ({ success: true });
export const updatePassword = async () => ({ success: true });
export const signOut = async () => ({ success: true });
export const onAuthStateChange = () => ({ data: { subscription: { unsubscribe: () => {} } } });

export const auth = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getSession,
    isAuthenticated,
    getUserProfile,
    updateUserProfile,
    resendConfirmationEmail,
    signInWithGoogle,
    sendPasswordResetEmail,
    updatePassword
};

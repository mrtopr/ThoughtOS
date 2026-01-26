import { supabase } from './supabaseClient';

// Sign up new user
export const signUp = async (email, password, displayName) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName
                }
            }
        });

        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
};

// Resend confirmation email
export const resendConfirmationEmail = async (email) => {
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Resend confirmation error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in existing user
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
};

// Update password (used after clicking link in reset email)
export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
};

// Sign out current user
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
};

// Get current user
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

// Get current session
export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
    const session = await getSession();
    return !!session;
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

// Get user profile from users table
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Get user profile error:', error);
        return null;
    }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update user profile error:', error);
        return { success: false, error: error.message };
    }
};

export const auth = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getSession,
    isAuthenticated,
    updateUserProfile,
    resendConfirmationEmail,
    signInWithGoogle,
    sendPasswordResetEmail,
    updatePassword
};

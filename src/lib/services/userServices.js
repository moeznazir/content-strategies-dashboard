import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const loginUser = async (loginData) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        });
        if (error) return { error: "Invalid email or password." };
        const userId = data?.user?.id;
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("current_user_id", userId);
        console.log("dataaaaaa",data);
        return data;

        
    } catch (error) {
        return { error: error.message };
    }
};


export const signUpUser = async (signUpData) => {
    try {

        const systemRoles = ["end-user"];
        const { data, error } = await supabase.auth.signUp({
            email: signUpData.email,
            password: signUpData.password,
            options: {
                data: {
                    system_roles: systemRoles,
                    title_roles: signUpData.title_roles,
                },
            },
        });

        if (error) throw error;

        return data;
    } catch (error) {
        return { error: error.message };
    }
};


export const resetPasswordLink = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        return { message: "Password reset email sent successfully" };
    } catch (error) {
        return { error: error.message };
    }
};


export const updatePassword = async (password) => {
    try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) throw new Error(error.message);

        return { message: "Password updated successfully" };
    } catch (error) {
        return { error: error.message || "An error occurred while updating your password." };
    }
};


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
        const system_roles = data?.user?.user_metadata?.system_roles;
        console.log("dataaaaaa", data);
        // 👉 Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
            .from("users_profiles")
            .select("company_id")
            .eq("id", userId)
            .single();
        console.log("Logged in user profile:", profile);
        if (profileError) {
            return { error: "Login succeeded, but failed to fetch company info." };
        }

        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("current_user_id", userId);
        localStorage.setItem("system_roles", system_roles);
        localStorage.setItem("company_id", profile.company_id);

        console.log("Logged in user profile:", profile);

        return {
            ...data,
            company_id: profile.company_id,
        };


    } catch (error) {
        return { error: error.message || "Something went wrong during sigin." };
    }
};



export const signUpUser = async (signUpData, companyId) => {
    try {
        const systemRoles = ["end-user"];
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('id', companyId)
            .maybeSingle();

        if (companyError) throw companyError;
        if (!company) throw new Error("Company does not exist");
        // Step 1: Sign up the user
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

        const userId = data?.user?.id;
        if (!userId) throw new Error("User ID not returned during signup.");

        const { error: profileError } = await supabase
            .from("users_profiles")
            .insert([
                {
                    id: userId,
                    company_id: companyId
                },
            ]);

        if (profileError) {
            return { error: "This email is already registered and verified. Try signing in." };
        }

        return { user: data.user };
    } catch (error) {
        return { error: error.message || "Something went wrong during signup." };
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


import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_API_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export const getAllUsers = async () => {
//     try {
//         // Fetch all users from Supabase
//         const { data, error } = await supabaseAdmin.auth.admin.listUsers();

//         if (error) {
//             return { error: error.message };
//         }
//         console.log("admin", data);
//         return { users: data.users }; // Return the clean users list
//     } catch (error) {
//         return { error: error.message };
//     }
// };
export const loginUser = async (loginData) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        });
        if (error) return { error: "Invalid email or password." };
        const userId = data?.user?.id;
        const system_roles = data?.user?.user_metadata?.system_roles;
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("current_user_id", userId);
        localStorage.setItem("system_roles", system_roles);
        console.log("dataaaaaa", data);
        // 👉 Fetch the user's profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", userId)
            .single();
            console.log("Logged in user profile:", profile);
        if (profileError) {
            // console.error("Failed to fetch profile:", profileError.message);
            return { error: "Login succeeded, but failed to fetch company info." };
        }

        // Store company_id if needed
        localStorage.setItem("company_id", profile.company_id);

        console.log("Logged in user profile:", profile);

        return {
            ...data,
            company_id: profile.company_id,
        };


    } catch (error) {
        // return { error: error.message };
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


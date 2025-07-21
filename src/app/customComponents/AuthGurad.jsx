"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AuthGuard = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();

    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem("token");
            const isExcludedPath =
                pathname.endsWith("/") ||
                pathname.endsWith("/login") ||
                pathname.endsWith("/forgot-password") ||
                pathname.endsWith("/reset-password") ||
                pathname.endsWith("/sign-up");

            if (!token && !isExcludedPath) {
                router.push("/login");
                return;
            }

            if (token) {
                const { data, error } = await supabase.auth.getUser();

                if (error || !data?.user) {
                    // User was deleted or token is invalid
                    localStorage.clear();
                    router.push("/login");
                    return;
                }

                // Optional: if logged in and on login page, redirect
                if (isExcludedPath) {
                    router.push("/assistant");
                    return;
                }
            }

            setChecked(true); // Done checking
        };

        checkAuthStatus();
    }, [router, pathname]);

    // Prevent rendering anything until auth is checked
    if (!checked) return null;

    return <>{children}</>;
};

export default AuthGuard;
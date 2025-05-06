"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useParams } from "next/navigation";

const AuthGuard = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const companySlug = params.companySlug;

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isExcludedPath =
            pathname.endsWith("/") ||
            pathname.endsWith("/login") ||
            pathname.endsWith("/forgot-password") ||
            pathname.endsWith("/reset-password") ||
            pathname.endsWith("/sign-up");

        if (token && isExcludedPath) {
            router.push(`/dashboard`);
        } else if (!token && !isExcludedPath) {
            router.push(`/login`);
        }
    }, [router, pathname]);

    return <>{children}</>;
};

export default AuthGuard;
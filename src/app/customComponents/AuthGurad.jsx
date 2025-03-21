"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { EXCLUED_PATHS } from "../constants/constant";

const AuthGuard = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token && EXCLUED_PATHS.includes(pathname)) {
            router.push("/dashboard");
        } else if (!token && !EXCLUED_PATHS.includes(pathname)) {
            router.push("/login");
        }
    }, [router, pathname]);

    return <>{children}</>;
};

export default AuthGuard;

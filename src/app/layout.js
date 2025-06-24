'use client';

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Spinner from "./loading";
import AuthGuard from "./customComponents/AuthGurad";
import NavigationMenu from "./customComponents/NavigationMenu";
import Alert from "./customComponents/Alert";
import { ToastContainer } from "react-toastify";
import { appColors } from "@/lib/theme";


export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
      <head>
        <title>Content Strategies</title>
      </head>
      <body style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }} cz-shortcut-listen="true">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Alert />
            <ToastContainer />
            <AuthGuard>
              <NavigationMenu />
              {children}
            </AuthGuard>
          </>
        )}
      </body>
    </html>
  );
}

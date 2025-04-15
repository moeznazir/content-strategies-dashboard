import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react"; // Import loading spinner
import Spinner from "./loading";
import AuthGuard from "./customComponents/AuthGurad";
import NavigationMenu from "./customComponents/NavigationMenu";
import Alert from "./customComponents/Alert";
import { ToastContainer } from "react-toastify";
import { appColors } from "@/lib/theme";

export const metadata = {
  title: "Content Strategies",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor}} >
      <body cz-shortcut-listen="true" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>

        <Suspense fallback={< Spinner />}>
          <Alert />
          <ToastContainer />
          <AuthGuard >
            <NavigationMenu />
            {children}
          </AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}

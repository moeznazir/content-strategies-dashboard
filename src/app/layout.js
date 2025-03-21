import "./globals.css";
import { Suspense } from "react"; // Import loading spinner
import Spinner from "./loading";
import AuthGuard from "./customComponents/AuthGurad";

export const metadata = {
  title: "Content Strategies",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <Suspense fallback={< Spinner />}>
          <AuthGuard >
            {children}
          </AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}

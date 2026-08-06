import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LockedIn Tutoring",
    template: "%s | LockedIn Tutoring",
  },
  description: "Connect with a tutor, schedule sessions, and track academic progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">

      <body
        className="bg-white antialiased"
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

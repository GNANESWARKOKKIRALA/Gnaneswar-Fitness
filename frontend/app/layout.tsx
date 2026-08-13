import type { Metadata } from "next";
import { Bebas_Neue, Oswald, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GymChatbot from "@/components/GymChatbot";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gnaneswar Fit | Classic Bodybuilding & Strength Coaching",
  description: "Elite bodybuilding coaching, customized progressive overload routines, macro diet plans, and progress tracking designed for maximum results by Coach Gnaneswar Kokkirala.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebas.variable} ${oswald.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
          <GymChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}

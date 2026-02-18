"use client";

import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getAironaTheme from "../theme/aironaTheme";
import ModernHeader from "@/components/layout/ModernHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/next';
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const [mode, setMode] = useState("light");
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // Load saved theme on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Show loading screen on route change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  const theme = useMemo(() => getAironaTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Check if current page should hide header
  const shouldHideHeader = pathname === '/hibiki';

  return (
    <html lang="en">
      <head>
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Airona Cult - ALL HAIL AIRONA" />
        <meta property="og:description" content="Airona Cult where you will find screenshots, fanarts of airona and some more features incoming. Feel free to checkout!" />
        <meta property="og:image" content="https://airona.club/airona/airona2.png" />
        <meta property="og:url" content="https://airona.club" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Airona Cult" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Airona Cult - ALL HAIL AIRONA" />
        <meta name="twitter:description" content="Airona Cult where you will find screenshots, fanarts of airona and some more features incoming. Feel free to checkout!" />
        <meta name="twitter:image" content="https://airona.club/airona/airona2.png" />
        
        {/* General Meta Tags */}
        <meta name="description" content="Airona Cult where you will find screenshots, fanarts of airona and some more features incoming. Feel free to checkout!" />
        <meta name="theme-color" content="#A6D86C" />
        
        {/* Force Light Theme for Social Previews */}
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SessionProvider>
          {loading && <LoadingScreen onLoadingComplete={() => setLoading(false)} />}
          {!shouldHideHeader && <ModernHeader toggleMode={toggleMode} />}
          {children}
          <Analytics />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getAironaTheme from "../theme/aironaTheme";
import Header from "@/components/layout/header";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  const [mode, setMode] = useState("light");

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

  const theme = useMemo(() => getAironaTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <html lang="en">
      <head>
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Airona Cult" />
        <meta property="og:description" content="Follow Airona and prosper in Lunos and adventure! 🪙✨" />
        <meta property="og:image" content="https://airona.club/airona/airona2.png" />
        <meta property="og:url" content="https://airona.club" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Airona Cult" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Airona Cult" />
        <meta name="twitter:description" content="Follow Airona and prosper in Lunos and adventure! 🪙✨" />
        <meta name="twitter:image" content="https://airona.club/airona/airona2.png" />
        
        {/* General Meta Tags */}
        <meta name="description" content="Airona Cult - Follow Airona and prosper in Lunos and adventure! 🪙✨" />
        <meta name="theme-color" content="#A6D86C" />
        
        {/* Force Light Theme for Social Previews */}
        <meta name="color-scheme" content="light" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SessionProvider>
          <Header toggleMode={toggleMode} />
          {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

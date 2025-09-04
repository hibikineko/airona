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

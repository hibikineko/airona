// src/theme/aironaTheme.js
import { createTheme } from "@mui/material/styles";

const getAironaTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // 🌞 LIGHT MODE COLORS with improved visibility
            primary: {
              main: "#8DC262", // Darker Airona green for better contrast
              light: "#A6D86C",
              dark: "#6B9B47",
              contrastText: "#FFFFFF",
            },
            secondary: {
              main: "#9C5DC9", // Deeper purple for better visibility
              light: "#B07FD9",
              dark: "#7A4B9F",
              contrastText: "#FFFFFF",
            },
            background: {
              default: "#F8F5FB", // Lighter background for better contrast
              paper: "#FFFFFF", // Pure white paper for maximum readability
            },
            text: {
              primary: "#2C2C2C", // Darker text for better readability
              secondary: "#5A5A5A", // Improved secondary text contrast
            },
            warning: {
              main: "#FF8C00", // Better orange for streaks
              contrastText: "#FFFFFF",
            },
            info: {
              main: "#6366F1", // Better blue-purple for info elements
              contrastText: "#FFFFFF",
            },
          }
        : {
            // 🌙 DARK MODE COLORS (unchanged)
            primary: {
              main: "#8DC262",
              light: "#A6D86C",
              dark: "#5C8138",
              contrastText: "#FFFFFF",
            },
            secondary: {
              main: "#B09BEF",
              contrastText: "#FFFFFF",
            },
            background: {
              default: "#121212",
              paper: "#1E1E1E",
            },
            text: {
              primary: "#FFFFFF",
              secondary: "#B0B0B0",
            },
          }),
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: "2.5rem" },
      h2: { fontWeight: 600, fontSize: "2rem" },
      h3: { fontWeight: 600, fontSize: "1.5rem" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            padding: "8px 20px",
            fontWeight: 600,
            "&:hover": {
              boxShadow: mode === "light" 
                ? "0px 4px 20px rgba(140,194,98,0.4)"
                : "0px 4px 12px rgba(166,216,108,0.5)",
            },
          },
          contained: {
            boxShadow: mode === "light"
              ? "0 2px 8px rgba(0,0,0,0.2)"
              : "0 2px 8px rgba(0,0,0,0.4)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            boxShadow: mode === "light"
              ? "0 4px 20px rgba(0,0,0,0.12)"
              : "0 6px 20px rgba(0,0,0,0.15)",
            border: mode === "light" 
              ? "1px solid rgba(156,93,201,0.15)"
              : "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: mode === "light"
              ? "0 2px 12px rgba(0,0,0,0.08)"
              : "0 6px 20px rgba(0,0,0,0.15)",
            border: mode === "light" 
              ? "1px solid rgba(156,93,201,0.1)"
              : "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
          colorWarning: {
            backgroundColor: mode === "light" ? "#FF8C00" : undefined,
            color: "#FFFFFF",
          },
        },
      },
    },
  });

export default getAironaTheme;

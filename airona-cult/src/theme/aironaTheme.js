// src/theme/aironaTheme.js
import { createTheme } from "@mui/material/styles";

const getAironaTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // 🌞 LIGHT MODE COLORS with subtle purple tint
            primary: {
              main: "#A6D86C", // Airona green
              light: "#C2E89A",
              dark: "#7EA84E",
              contrastText: "#1C1C1C",
            },
            secondary: {
              main: "#C7B7F9", // magical purple accent
              contrastText: "#1C1C1C",
            },
            background: {
              default: "#ECE4F5", // slightly darker purple-tinted background
              paper: "#F3EAFB", // paper also matches with subtle tint
            },
            text: {
              primary: "#1C1C1C",
              secondary: "#4F4F4F",
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
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(166,216,108,0.5)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          },
        },
      },
    },
  });

export default getAironaTheme;

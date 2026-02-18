"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function CoverPage({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          fontSize: "4rem",
          opacity: 0.3,
        }}
      >
        {theme.decorative.lantern}
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "2rem",
          left: "2rem",
          fontSize: "3rem",
          opacity: 0.3,
        }}
      >
        {theme.decorative.blossom}
      </Box>

      {/* Main Content */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "3rem", md: "5rem" },
          fontWeight: 800,
          color: theme.colors.lightText,
          textAlign: "center",
          mb: 2,
          textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {data.title}
      </Typography>
      
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: "1.5rem", md: "2.5rem" },
          color: theme.colors.secondary,
          textAlign: "center",
          mb: 1,
          textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {data.subtitle}
      </Typography>

      <Typography
        variant="h5"
        sx={{
          fontSize: { xs: "1rem", md: "1.5rem" },
          color: theme.colors.lightText,
          textAlign: "center",
          opacity: 0.9,
        }}
      >
        {data.season}
      </Typography>

      {/* Bottom decorative text */}
      <Box
        sx={{
          position: "absolute",
          bottom: "3rem",
          fontSize: "2rem",
        }}
      >
        {theme.decorative.dragon} {theme.decorative.redEnvelope} {theme.decorative.firework}
      </Box>
    </Box>
  );
}

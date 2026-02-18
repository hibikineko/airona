"use client";

import { Box, Typography } from "@mui/material";

export default function BackCover({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.primary} 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: theme.colors.secondary,
          mb: 4,
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        Credits
      </Typography>

      <Box sx={{ mb: 4 }}>
        {data.contributors.map((contributor, index) => (
          <Typography
            key={index}
            variant="body1"
            sx={{
              color: theme.colors.lightText,
              textAlign: "center",
              mb: 1,
              fontSize: "1.1rem",
            }}
          >
            {contributor}
          </Typography>
        ))}
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: theme.colors.secondary,
          textAlign: "center",
          mt: 4,
        }}
      >
        Thank you for reading! {theme.decorative.blossom}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: theme.colors.lightText,
          textAlign: "center",
          mt: 2,
          opacity: 0.8,
        }}
      >
        Airona Files © 2026
      </Typography>
    </Box>
  );
}

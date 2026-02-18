"use client";

import { Box, Typography } from "@mui/material";

export default function OutfitShowcase({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: theme.colors.background,
        p: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: theme.colors.primary,
          mb: 2,
          fontWeight: 700,
        }}
      >
        {data.title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: theme.colors.text,
          mb: 3,
          fontSize: "1.1rem",
        }}
      >
        {data.description}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, height: "calc(100% - 150px)" }}>
        {data.images.slice(0, 2).map((img, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}
          >
            <Typography sx={{ color: theme.colors.text }}>
              Outfit {index + 1}
            </Typography>
          </Box>
        ))}
      </Box>

      {data.outfitDetails && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            sx={{ color: theme.colors.text, fontWeight: 600 }}
          >
            Theme: {data.outfitDetails.theme}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.colors.text }}>
            Colors: {data.outfitDetails.colors.join(", ")}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

"use client";

import { Box, Typography } from "@mui/material";

export default function FullImagePage({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.secondary}40)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: theme.colors.text,
          textAlign: "center",
          p: 4,
        }}
      >
        [Full Image Placeholder]
      </Typography>

      {data.caption && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.7)",
            p: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "white",
              textAlign: "center",
            }}
          >
            {data.caption}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

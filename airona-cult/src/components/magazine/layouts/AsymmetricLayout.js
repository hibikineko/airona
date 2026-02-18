"use client";

import { Box, Typography } from "@mui/material";

export default function AsymmetricLayout({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: theme.colors.background,
      }}
    >
      {data.sections.map((section, index) => (
        <Box
          key={index}
          sx={{
            height: "50%",
            display: "flex",
            flexDirection: section.type === "image-left" ? "row" : "row-reverse",
            alignItems: "center",
            p: 3,
          }}
        >
          {/* Image Side */}
          <Box
            sx={{
              flex: 1,
              height: "100%",
              background: `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.secondary}30)`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: section.type === "image-left" ? 2 : 0,
              ml: section.type === "image-right" ? 2 : 0,
            }}
          >
            <Typography sx={{ color: theme.colors.text }}>
              [Image Placeholder]
            </Typography>
          </Box>

          {/* Text Side */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: theme.colors.text,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {section.text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

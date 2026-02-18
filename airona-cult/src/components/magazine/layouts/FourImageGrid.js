"use client";

import { Box, Typography, Grid } from "@mui/material";
import Image from "next/image";

export default function FourImageGrid({ data, theme }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 4,
        background: theme.colors.background,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: theme.colors.primary,
          mb: 3,
          textAlign: "center",
          fontWeight: 700,
        }}
      >
        {data.title}
      </Typography>

      <Grid container spacing={2} sx={{ height: "calc(100% - 80px)" }}>
        {data.images.map((img, index) => (
          <Grid item xs={6} sm={6} md={6} key={index} sx={{ display: "flex" }}>  
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "200px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {/* Placeholder for image */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: theme.colors.text, fontSize: "0.9rem", textAlign: "center", px: 2 }}>
                  {img.caption}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

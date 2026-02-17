"use client";

import { Box, Typography, Grid, Card } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function ContentCarousel({ title, items = [], type }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {items.slice(0, 6).map((item, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card
              sx={{
                position: "relative",
                paddingTop: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              <Image
                src={item.url || item.image_url}
                alt={item.alt || item.title || `${type} ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 16vw"
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

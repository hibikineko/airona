"use client";

import { Box, Container, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import Link from "next/link";
import { useTheme } from "@mui/material";

const magazines = [
  {
    slug: "cny-2026",
    title: "CNY 2026",
    subtitle: "Year of the Horse Edition",
    color: "#E74C3C",
    icon: "🏮",
    available: true,
  },
  // Placeholder for future issues
  {
    slug: "valentine-2026",
    title: "Valentine 2026",
    subtitle: "Love & Fashion Special",
    color: "#FF69B4",
    icon: "💕",
    available: false,
  },
  {
    slug: "spring-2026",
    title: "Spring 2026",
    subtitle: "Blossom Season Collection",
    color: "#8CC262",
    icon: "🌸",
    available: false,
  },
];

export default function MagazineIndexPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
          : "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            textAlign: "center",
            background: "linear-gradient(135deg, #8DC262, #9C5DC9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Airona Files 📖
        </Typography>

        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            mb: 6,
            color: "text.secondary",
          }}
        >
          Digital Fashion Magazine - BPSR Style
        </Typography>

        <Grid container spacing={4}>
          {magazines.map((mag) => (
            <Grid item xs={12} sm={6} md={4} key={mag.slug}>
              <Card
                sx={{
                  height: "100%",
                  background: mag.available ? "white" : "rgba(255,255,255,0.5)",
                  opacity: mag.available ? 1 : 0.6,
                  transition: "all 0.3s ease",
                  "&:hover": mag.available
                    ? {
                        transform: "translateY(-8px)",
                        boxShadow: `0 12px 32px ${mag.color}40`,
                      }
                    : {},
                }}
              >
                {mag.available ? (
                  <CardActionArea
                    component={Link}
                    href={`/magazine/${mag.slug}`}
                    sx={{ height: "100%", minHeight: 300 }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 4 }}>
                      <Typography sx={{ fontSize: "5rem", mb: 2 }}>
                        {mag.icon}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: mag.color,
                        }}
                      >
                        {mag.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {mag.subtitle}
                      </Typography>
                      <Typography
                        variant="button"
                        sx={{
                          mt: 3,
                          display: "block",
                          color: mag.color,
                          fontWeight: 600,
                        }}
                      >
                        Read Now →
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                ) : (
                  <CardContent sx={{ textAlign: "center", p: 4, minHeight: 300 }}>
                    <Typography sx={{ fontSize: "5rem", mb: 2 }}>
                      {mag.icon}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: "text.secondary",
                      }}
                    >
                      {mag.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {mag.subtitle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        display: "block",
                        color: "text.secondary",
                      }}
                    >
                      Coming Soon
                    </Typography>
                  </CardContent>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

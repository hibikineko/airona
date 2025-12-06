"use client";

import { Box, Typography, Button, Container, Grid, Card, CardContent, useTheme } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { 
  SportsEsports, 
  Event, 
  PhotoLibrary, 
  Group,
  Celebration,
  TrendingUp
} from "@mui/icons-material";

const features = [
  {
    title: "Blue Protocol SR",
    description: "Explore the world of Star Resonance with Airona! Join our BPSR community.",
    icon: "🎮",
    color: "#8DC262",
    link: "/airona",
    image: "/airona/airona_happy.png"
  },
  {
    title: "Where Winds Meet",
    description: "Join our guild in the world of martial arts and Chinese fantasy adventure.",
    color: "#C41E3A",
    link: "/game/wwm",
    image: "/wwm/Icon_WhereWindsMeet.png"
  },
  {
    title: "Events & Activities",
    description: "Stay updated with upcoming events, tournaments, and character birthdays.",
    icon: <Event sx={{ fontSize: 48 }} />,
    color: "#9C5DC9",
    link: "/events"
  },
  {
    title: "Community Gallery",
    description: "Share and discover amazing fanart, screenshots, and creative content.",
    icon: <PhotoLibrary sx={{ fontSize: 48 }} />,
    color: "#FF6B9D",
    link: "/gallery"
  },
];

const games = [
  { name: "Blue Protocol SR", icon: "🎮", members: "150+", status: "Active" },
  { name: "Where Winds Meet", icon: "🗡️", members: "80+", status: "Active" },
  { name: "Wuthering Waves", icon: "🌊", members: "120+", status: "Active" },
  { name: "Honkai Star Rail", icon: "⭐", members: "90+", status: "Active" },
];

export default function HeroSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "70vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
        }}
      >
        {/* Animated background circles */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "10%",
            width: { xs: "200px", md: "400px" },
            height: { xs: "200px", md: "400px" },
            borderRadius: "50%",
            background: "rgba(140, 194, 98, 0.15)",
            animation: "float 6s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0) scale(1)" },
              "50%": { transform: "translateY(-30px) scale(1.05)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "15%",
            left: "5%",
            width: { xs: "150px", md: "300px" },
            height: { xs: "150px", md: "300px" },
            borderRadius: "50%",
            background: "rgba(166, 216, 108, 0.2)",
            animation: "float 8s ease-in-out infinite 1s",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left side - Text content */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  animation: "fadeInUp 1s ease-out",
                  "@keyframes fadeInUp": {
                    "0%": { opacity: 0, transform: "translateY(30px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                    background: "linear-gradient(135deg, #8DC262, #A6D86C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: isDark ? "none" : "2px 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  Welcome to
                  <br />
                  AironaCult
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: isDark ? "#b0b0b0" : "#5a5a5a",
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Your multi-game community hub for BPSR, WWM, WuWa, HSR and more.
                  Join us for events, share content, and connect with fellow players! 🎮✨
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    component={Link}
                    href="/airona"
                    variant="contained"
                    size="large"
                    className="airona-button"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Explore BPSR Section
                  </Button>
                  <Button
                    component={Link}
                    href="/guild"
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      "&:hover": {
                        borderColor: theme.palette.primary.dark,
                        background: "rgba(140, 194, 98, 0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Join Community
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Airona image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  animation: "floatImage 4s ease-in-out infinite",
                  "@keyframes floatImage": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "500px",
                    margin: "0 auto",
                    aspectRatio: "1",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8DC262, #A6D86C)",
                    padding: "20px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    <Image
                      src="/airona/airona_yay.png"
                      alt="Airona"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: "center",
            mb: 6,
            fontWeight: 700,
            background: "linear-gradient(135deg, #8DC262, #9C5DC9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Explore Our Community
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: "flex" }}>
              <Card
                component={Link}
                href={feature.link}
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  borderRadius: "24px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: `0 16px 40px ${feature.color}40`,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "6px",
                    background: feature.color,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", minHeight: 280 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      mb: 3,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: `4px solid ${feature.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: feature.image ? "transparent" : "transparent",
                    }}
                  >
                    {feature.image ? (
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={100}
                        height={100}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    ) : (
                      <Box sx={{ fontSize: 56, color: feature.color }}>
                        {feature.icon}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, minHeight: 32 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Games Section */}
      <Box
        sx={{
          py: 8,
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              mb: 6,
              fontWeight: 700,
              background: "linear-gradient(135deg, #8DC262, #9C5DC9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Our Games
          </Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {games.map((game, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  className="glass-card"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 12px 32px rgba(140, 194, 98, 0.3)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "3rem", mb: 2 }}>{game.icon}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {game.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {game.members} members
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      borderRadius: "12px",
                      background: "rgba(140, 194, 98, 0.2)",
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {game.status}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

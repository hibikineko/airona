"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Button,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
const aironaTraits = [
  {
    image: "/airona/airona_happy.png",
    title: "Sweet & Easygoing",
    description: "A super sweet and easygoing girl (self-proclaimed). Always radiating positive energy!",
    color: "#FFD700"
  },
  {
    image: "/airona/airona_proud.png",
    title: "Legendary Adventurer",
    description: "A renowned legendary adventurer with knowledge and experience far beyond that of ordinary people.",
    color: "#9C5DC9"
  },
  {
    image: "/airona/airona_dollar.png",
    title: "Treasure Hunter",
    description: "Loves collecting Lunos and treasures! Can't resist a good deal or shiny loot. 💰",
    color: "#8DC262"
  },
  {
    image: "/airona/airona_tehehe.png",
    title: "Mischievous Teaser",
    description: "Has a bit of a mischievous streak and enjoys teasing those she's close to. Tehehe~",
    color: "#FF6B9D"
  },
];

const aironaFacts = [
  "Uses a Rune Ring as her weapon of choice",
  'Often says she "can\'t be bothered with trouble," but she\'s incredibly reliable when it matters most',
  "Treasures her hair and takes great care of it",
  "Her origins remain a mystery - no one on The Continent of Magna knows where she came from",
  "She brought you back from the forest, and your story with her has only just begun",
  '"Don\'t be shackled by yesterday, because I will face the uncharted, unknown tomorrow with you."'
];

export default function AironaClient() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Hero Banner with Airona Intro Image */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: { xs: "400px", md: "600px", lg: "700px" },
          overflow: "hidden",
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: "auto",
            maxWidth: "100%",
          }}
        >
          <Image
            src="/airona/airona_intro.jpg"
            alt="Airona Introduction"
            height={700}
            width={0}
            style={{ 
              height: "100%", 
              width: "auto",
              objectFit: "contain"
            }}
            priority
          />
        </Box>
      </Box>

      {/* Introduction Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              background: "linear-gradient(135deg, #8DC262, #A6D86C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Meet Airona! 🌿
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              color: isDark ? "#b0b0b0" : "#5a5a5a",
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            The Cheerful Mascot of Blue Protocol: Star Resonance
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              color: isDark ? "#b0b0b0" : "#5a5a5a",
              lineHeight: 1.8,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Airona is the heart and soul of our BPSR community! With her infectious enthusiasm, 
            love for adventure, and an undeniable passion for Lunos, she embodies everything 
            we love about the world of Star Resonance. Join her on exciting adventures and 
            discover what makes her so special! ✨
          </Typography>
        </Box>
      </Container>

      {/* Personality Traits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
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
          Airona's Personality ✨
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {aironaTraits.map((trait, index) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  minHeight: "320px",
                  maxWidth: "500px",
                  mx: "auto",
                  borderRadius: "24px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: `0 16px 40px ${trait.color}40`,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "6px",
                    background: trait.color,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      mb: 3,
                      borderRadius: "50%",
                      border: `4px solid ${trait.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={trait.image}
                      alt={trait.title}
                      width={92}
                      height={92}
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {trait.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {trait.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Fun Facts Section */}
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
            Fun Facts About Airona 🎉
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {aironaFacts.map((fact, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  sx={{
                    height: "100px",
                    maxWidth: "900px",
                    mx: "auto",
                    p: 3,
                    borderRadius: "16px",
                    background: isDark ? "rgba(255,255,255,0.05)" : "white",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(8px)",
                      boxShadow: "0 8px 24px rgba(140, 194, 98, 0.3)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
                    <Typography
                      sx={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        minWidth: "40px",
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.6 }}>
                      {fact}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: "32px",
            background: "linear-gradient(135deg, #8DC262, #A6D86C)",
            color: "white",
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Join Airona's Adventures!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
            Explore BPSR content, play games, and share your moments with the community!
          </Typography>
          <Button
            component={Link}
            href="/game/card"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: "16px",
              background: "white",
              color: "#8DC262",
              fontWeight: 700,
              "&:hover": {
                background: "#f5f5f5",
                transform: "translateY(-4px)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
              },
            }}
          >
            Play Memory Game 🧩
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

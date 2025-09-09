"use client";

import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";

export default function AironaPage() {
  const funFacts = [
    {
      img: "airona1.png",
      title: "Personality",
      text: "Airona is bubbly, curious, and mischievous — but very serious when it comes to money!",
    },
    {
      img: "airona2.png",
      title: "Role in Game",
      text: "She acts as a mascot and guide, surprising players with witty remarks.",
    },
    {
      img: "airona3.png",
      title: "Famous Quote",
      text: "“More money… MORE MONEY!!” 💸",
    },
    {
      img: "airona4.png",
      title: "Companion Spirit",
      text: "Often seen encouraging adventurers, she lifts morale with her playful energy.",
    },
    {
      img: "airona5.png",
      title: "Design Inspiration",
      text: "Her outfit blends nature motifs and magical accents — symbolizing freedom.",
    },
    {
      img: "airona6.png",
      title: "Trivia",
      text: "Airona is rumored to have a secret stash of coins hidden across the game world.",
    },
    {
      img: "airona7.png",
      title: "Voice Acting",
      text: "Tomori Kusunoki brings Airona to life with a sweet yet mischievous tone.",
    },
    {
      img: "airona8.png",
      title: "Legacy",
      text: "Fans love collecting her stickers, art, and moments — she’s become a true mascot icon.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" color="primary" gutterBottom>
          Meet Airona 🌿
        </Typography>
        <Typography variant="h6" color="text.secondary">
          The cheerful mascot of <strong>Blue Protocol: Star Resonance</strong>
        </Typography>
      </Box>

      {/* Bio Section */}
      <Card sx={{ mb: 6 }}>
        <CardContent>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  src="/airona/airona_intro.jpg"
                  alt="Airona Full"
                  width={700}
                  height={500}
                  style={{
                    width: "100%",
                    maxWidth: "700px",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "16px",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom color="primary.dark">
                Bio
              </Typography>
              <Typography variant="body1" paragraph>
                Airona is the adorable mascot of the anime MMORPG{" "}
                <strong>Blue Protocol: Star Resonance</strong>. Known for her
                playful charm and endless love for adventure, she quickly
                captured the hearts of players worldwide.
              </Typography>
              <Typography variant="body1" paragraph>
                She is voiced by the talented <strong>Tomori Kusunoki</strong>,
                bringing her bright and charming personality to life.
              </Typography>
              <Typography variant="body1" paragraph>
                Her hobbies? Simple — <em>earning money and… more money!</em> 💰✨
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fun Facts Section */}
      <Box mb={6}>
        <Typography variant="h4" color="secondary" gutterBottom>
          🌸 Fun Facts & Lore
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} justifyContent="center">
          {funFacts.map((fact, i) => (
            <Grid
              item
              xs={12} // 1 per row on mobile
              md={6} // 2 per row on desktop
              key={i}
              sx={{ display: "flex", justifyContent: "center" }} // center the card
            >
              <Card
                sx={{
                  width: 500, // fixed width on desktop
                  height: 280, // fixed height
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 2,
                }}
              >
                <CardContent
                  sx={{
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <Image
                    src={`/airona/${fact.img}`}
                    alt={fact.title}
                    width={120}
                    height={120}
                    style={{
                      maxWidth: "80%",
                      height: "auto",
                      marginBottom: "12px",
                    }}
                  />
                  <Typography variant="h6" mt={1}>
                    {fact.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {fact.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Closing Section */}
      <Box textAlign="center" mt={8}>
        <Typography variant="h5" color="primary">
          ✨ Airona is more than just a mascot — she’s the spirit of adventure! ✨
        </Typography>
      </Box>
    </Container>
  );
}

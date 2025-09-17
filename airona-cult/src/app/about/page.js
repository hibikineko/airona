"use client";

import { Box, Container, Typography, Card, CardContent, Divider, Link } from "@mui/material";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Mascot and Title */}
      <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={5}>
        <Image src={"/airona/airona2.png"} alt="Airona Mascot" width={120} height={120} />
        <Typography variant="h1" sx={{ mt: 2, fontSize: { xs: "2rem", md: "2.5rem" } }}>
          About Airona Club
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Welcome to Airona Club — the first and only guild fully dedicated to praising Airona, 
          the mischievous mascot who lives for adventure… and more money!
        </Typography>
      </Box>

      {/* Sections */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            ✨ What We’re About
          </Typography>
          <Typography>
            We are a group of players dedicated to spreading the word of Airona across all of Regnus! 
            Airona Club is a fan page designed to express our love for Airona, 
            mascot of the anime MMORPG <strong>Blue Protocol: Star Resonance</strong>.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            📖 What You’ll Find Here
          </Typography>
          <Box component="ul" sx={{ pl: 3, mt: 1 }}>
            <li>
              <Typography>Community Projects – collaborative events and cultist activities.</Typography>
            </li>
            <li>
              <Typography>More Airona – fan arts and in-game creative screenshots.</Typography>
            </li>
            <li>
              <Typography>
                Club Features – we also have an in-game guild called{" "}
                <Link href="/guild" underline="hover" color="secondary">
                  Airona
                </Link>
                .
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            🎯 Our Goal
          </Typography>
          <Typography>
            To build a strong, fun-loving community where everyone can enjoy the game together. ✨
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            🌸 Why {"\"Airona\""}?
          </Typography>
          <Typography>
            Airona is our goddess!{" "}
            <Link href="/airona" underline="hover" color="secondary">
              Click here
            </Link>{" "}
            to know more about her.
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Disclaimer */}
      <Typography variant="body2" color="text.secondary" align="center">
        Disclaimer: This website is a personal project fully supported by the community and is not
        affiliated with any commercial entity. All Airona and in-game assets belong to their original
        source.
      </Typography>
    </Container>
  );
}

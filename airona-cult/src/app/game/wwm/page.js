"use client";

import { Box, Container, Typography, Card, CardContent, Grid, Button, useTheme } from "@mui/material";
import { Group, Event, Info } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";

export default function WWMPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #f5e6d3 0%, #e8d5c4 50%, #d4c5b0 100%)",
          py: 10,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography sx={{ fontSize: "4rem", mb: 2 }}>🗡️</Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: "linear-gradient(135deg, #8B4513, #D2691E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Where Winds Meet
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join our guild in the martial arts MMORPG!
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Guild Info */}
        <Card
          sx={{
            mb: 6,
            borderRadius: "24px",
            overflow: "hidden",
            background: isDark
              ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
              : "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 6 } }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Group sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  Guild Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  We are actively recruiting members for our Where Winds Meet guild! Join us for
                  group activities, quests, and epic martial arts adventures.
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Guild Name
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      AironaCult
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Server
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      TBA
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Members
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      80+
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    width: "100%",
                    height: 300,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #8B4513, #D2691E)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "8rem",
                  }}
                >
                  ⚔️
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* How to Join */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                p: 3,
                textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(140, 194, 98, 0.3)",
                },
              }}
            >
              <Typography sx={{ fontSize: "3rem", mb: 2 }}>1️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Join Discord
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect with us on our community Discord server
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                p: 3,
                textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(140, 194, 98, 0.3)",
                },
              }}
            >
              <Typography sx={{ fontSize: "3rem", mb: 2 }}>2️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Apply
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out a quick application form
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                p: 3,
                textAlign: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 32px rgba(140, 194, 98, 0.3)",
                },
              }}
            >
              <Typography sx={{ fontSize: "3rem", mb: 2 }}>3️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Start Playing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get invited and join our adventures!
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* CTA */}
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #8DC262, #A6D86C)",
            color: "white",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Join?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
            Become part of our Where Winds Meet guild today!
          </Typography>
          <Button
            component={Link}
            href="/guild/apply"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
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
            Apply Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

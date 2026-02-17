"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import ContentCarousel from "@/components/ContentCarousel";

export default function ModernBPSRClient({ fanart = [], screenshots = [], sesbian = [] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      {/* Simple Hero Section with Airona */}
      <Box
        sx={{
          position: "relative",
          py: { xs: 6, md: 8 },
          overflow: "hidden",
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Airona Image */}
            <Box
              sx={{
                flex: { xs: "0 0 auto", md: "0 0 40%" },
                position: "relative",
                width: { xs: "280px", sm: "350px", md: "400px" },
                height: { xs: "280px", sm: "350px", md: "400px" },
                animation: "float 4s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-20px)" },
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
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
                    src="/airona/airona_intro.jpg"
                    alt="Meet Airona"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </Box>
              </Box>
            </Box>

            {/* Text Content */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
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
                  lineHeight: 1.6,
                }}
              >
                The cheerful mascot of Blue Protocol: Star Resonance
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  fontSize: "1.1rem",
                  color: isDark ? "#b0b0b0" : "#5a5a5a",
                  lineHeight: 1.8,
                }}
              >
                Bubbly, curious, and mischievous — but very serious when it comes to money! 
                Join Airona in sharing your BPSR moments and playing fun games. 💰✨
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content Sections */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Quick Links */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            mb: 6,
          }}
        >
          <Button
            component={Link}
            href="/gallery"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #FF6B9D, #C44569)",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              "&:hover": {
                background: "linear-gradient(135deg, #FF8BB5, #E05585)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(255, 107, 157, 0.4)",
              },
            }}
          >
            🖼️ View Gallery
          </Button>
          <Button
            component={Link}
            href="/game/card"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #9C5DC9, #7A4B9F)",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              "&:hover": {
                background: "linear-gradient(135deg, #B07FD9, #9C5DC9)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(156, 93, 201, 0.4)",
              },
            }}
          >
            🧩 Memory Game
          </Button>
          <Button
            component={Link}
            href="/upload"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #8DC262, #6B9B47)",
              color: "white",
              fontWeight: 700,
              fontSize: "1rem",
              "&:hover": {
                background: "linear-gradient(135deg, #A6D86C, #8DC262)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(140, 194, 98, 0.4)",
              },
            }}
          >
            📤 Upload Content
          </Button>
        </Box>

        {/* Community Content Section */}
        <Box
          sx={{
            py: 8,
            px: { xs: 2, md: 4 },
            mb: 8,
            borderRadius: "32px",
            background: isDark
              ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
              : "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
          }}
        >
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: "linear-gradient(135deg, #8DC262, #9C5DC9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Community Creations 🎨
          </Typography>

          {/* Fanart Carousel */}
          {fanart && fanart.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <ContentCarousel title="✨ Latest Fanart" items={fanart} type="fanart" />
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  component={Link}
                  href="/gallery/fanart"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": {
                      background: "rgba(140, 194, 98, 0.1)",
                    },
                  }}
                >
                  View All Fanart →
                </Button>
              </Box>
            </Box>
          )}

          {/* Screenshots Carousel */}
          {screenshots && screenshots.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <ContentCarousel title="📸 Latest Screenshots" items={screenshots} type="screenshot" />
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  component={Link}
                  href="/gallery/screenshot"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": {
                      background: "rgba(140, 194, 98, 0.1)",
                    },
                  }}
                >
                  View All Screenshots →
                </Button>
              </Box>
            </Box>
          )}

          {/* Sesbian Carousel */}
          {sesbian && sesbian.length > 0 && (
            <Box sx={{ mb: 0 }}>
              <ContentCarousel title="💕 Latest Sesbian" items={sesbian} type="sesbian" />
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  component={Link}
                  href="/gallery/sesbian"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    "&:hover": {
                      background: "rgba(140, 194, 98, 0.1)",
                    },
                  }}
                >
                  View All Sesbian →
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* CTA Section */}
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
            Ready to Share Your BPSR Moments?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
            Upload your screenshots, fanart, and connect with other BPSR fans!
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              component={Link}
              href="/upload"
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
              Upload Content 📤
            </Button>
            <Button
              component={Link}
              href="/game/card"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                borderRadius: "16px",
                borderColor: "white",
                color: "white",
                fontWeight: 700,
                borderWidth: 2,
                "&:hover": {
                  borderColor: "white",
                  background: "rgba(255, 255, 255, 0.15)",
                  transform: "translateY(-4px)",
                  borderWidth: 2,
                },
              }}
            >
              Play Memory Game 🧩
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

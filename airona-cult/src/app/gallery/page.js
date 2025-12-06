"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  useTheme,
  Button,
  Chip,
} from "@mui/material";
import { PhotoLibrary, Favorite, Comment } from "@mui/icons-material";
import Link from "next/link";

const categories = [
  { label: "All", value: "all" },
  { label: "Fanart", value: "fanart", icon: "🎨" },
  { label: "Screenshots", value: "screenshot", icon: "📸" },
  { label: "Sesbian", value: "sesbian", icon: "💕" },
];

const games = ["All Games", "BPSR", "WWM", "WuWa", "HSR"];

// Placeholder gallery items
const placeholderItems = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Gallery Item ${i + 1}`,
  type: ["fanart", "screenshot", "sesbian"][i % 3],
  game: ["BPSR", "WWM", "WuWa", "HSR"][i % 4],
  likes: Math.floor(Math.random() * 100),
  comments: Math.floor(Math.random() * 20),
}));

export default function UniversalGalleryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGame, setSelectedGame] = useState("All Games");

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const filteredItems = placeholderItems.filter((item) => {
    const categoryMatch = selectedCategory === "all" || item.type === selectedCategory;
    const gameMatch = selectedGame === "All Games" || item.game === selectedGame;
    return categoryMatch && gameMatch;
  });

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
            : "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <PhotoLibrary sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: "linear-gradient(135deg, #8DC262, #9C5DC9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Universal Gallery
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Explore amazing content from all games in our community!
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Category Tabs */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: 600,
                minWidth: { xs: 80, sm: 120 },
              },
            }}
          >
            {categories.map((category) => (
              <Tab
                key={category.value}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {category.icon && <span>{category.icon}</span>}
                    <span>{category.label}</span>
                  </Box>
                }
                value={category.value}
              />
            ))}
          </Tabs>
        </Box>

        {/* Game Filter */}
        <Box sx={{ mb: 4, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
          {games.map((game) => (
            <Chip
              key={game}
              label={game}
              onClick={() => setSelectedGame(game)}
              sx={{
                px: 1,
                fontWeight: 600,
                cursor: "pointer",
                background: selectedGame === game ? theme.palette.primary.main : "transparent",
                color: selectedGame === game ? "white" : "inherit",
                border: `2px solid ${
                  selectedGame === game ? theme.palette.primary.main : theme.palette.divider
                }`,
                "&:hover": {
                  background:
                    selectedGame === game
                      ? theme.palette.primary.dark
                      : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                },
              }}
            />
          ))}
        </Box>

        {/* Upload Button */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Button
            component={Link}
            href="/upload"
            variant="contained"
            className="airona-button"
            size="large"
            sx={{ px: 4, py: 1.5, borderRadius: "16px" }}
          >
            📤 Upload Your Content
          </Button>
        </Box>

        {/* Gallery Grid */}
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 16px 48px rgba(140, 194, 98, 0.3)",
                  },
                }}
              >
                <CardMedia
                  sx={{
                    height: 250,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.light}40, 
                      ${theme.palette.secondary.light}40)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                  }}
                >
                  {categories.find((c) => c.value === item.type)?.icon || "🖼️"}
                </CardMedia>
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: "1rem" }}>
                    {item.title}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Chip
                      label={item.game}
                      size="small"
                      sx={{
                        background: theme.palette.primary.light,
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                    <Chip
                      label={item.type}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, color: "text.secondary" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Favorite sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{item.likes}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Comment sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{item.comments}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Load More */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is a preview. Connect to your database to load real content!
          </Typography>
          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              borderRadius: "16px",
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.dark,
                background: "rgba(140, 194, 98, 0.1)",
              },
            }}
          >
            Load More
          </Button>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            mt: 8,
            p: 6,
            textAlign: "center",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #8DC262, #A6D86C)",
            color: "white",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Share Your Creativity!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
            Upload your fanart, screenshots, or other content to share with the community.
          </Typography>
          <Button
            component={Link}
            href="/upload"
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
            Upload Now 📤
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

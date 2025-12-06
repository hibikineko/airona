"use client";

import { Box, Container, Typography, Card, CardContent, Grid, useTheme, Chip } from "@mui/material";
import { Event, Cake, EmojiEvents, Celebration } from "@mui/icons-material";
import { useState } from "react";

const upcomingEvents = [
  {
    title: "Halloween Tournament Finals",
    date: "2025-12-15",
    time: "19:00 UTC",
    type: "tournament",
    game: "BPSR",
    description: "Final showdown of the Halloween character popularity contest!",
  },
  {
    title: "Weekly Fortune Draw Event",
    date: "2025-12-05",
    time: "All Day",
    type: "gacha",
    game: "BPSR",
    description: "Increased rates for rare cards! Don't miss out!",
  },
  {
    title: "Guild Meetup",
    date: "2025-12-10",
    time: "20:00 UTC",
    type: "social",
    game: "All",
    description: "Join us for a casual gaming session across all titles.",
  },
  {
    title: "Airona's Birthday",
    date: "2025-12-20",
    type: "birthday",
    game: "BPSR",
    description: "Celebrate our favorite money-loving mascot!",
  },
];

const recurringEvents = [
  {
    title: "Weekly Guild Raids",
    schedule: "Every Saturday 20:00 UTC",
    game: "BPSR",
    type: "raid",
  },
  {
    title: "Community Art Contest",
    schedule: "Monthly - 1st Week",
    game: "All",
    type: "contest",
  },
  {
    title: "Screenshot Saturday",
    schedule: "Every Saturday",
    game: "All",
    type: "social",
  },
];

const eventColors = {
  tournament: "#9C5DC9",
  gacha: "#FFD700",
  social: "#8DC262",
  birthday: "#FF6B9D",
  raid: "#FF8C00",
  contest: "#87CEEB",
};

export default function EventsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
          <Event sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
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
            Events & Calendar
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Stay updated with all our community events, tournaments, and special occasions!
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Upcoming Events */}
        <Box mb={8}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: theme.palette.primary.main,
            }}
          >
            <Celebration /> Upcoming Events
          </Typography>
          <Grid container spacing={3}>
            {upcomingEvents.map((event, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 32px ${eventColors[event.type]}50`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "6px",
                      background: eventColors[event.type],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.game}
                        size="small"
                        sx={{
                          background: eventColors[event.type],
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                      {event.date && (
                        <Typography variant="body2" color="text.secondary">
                          📅 {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography>
                      )}
                      {event.time && (
                        <Typography variant="body2" color="text.secondary">
                          🕐 {event.time}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recurring Events */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: "24px",
            background: isDark
              ? "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)"
              : "linear-gradient(135deg, #f8faf9 0%, #e8f5e9 100%)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: theme.palette.primary.main,
            }}
          >
            <EmojiEvents /> Recurring Events
          </Typography>
          <Grid container spacing={3}>
            {recurringEvents.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  className="glass-card"
                  sx={{
                    p: 3,
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: `0 12px 32px ${eventColors[event.type]}40`,
                    },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.schedule}
                    sx={{
                      mb: 2,
                      background: eventColors[event.type],
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {event.game}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Calendar Coming Soon */}
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
          <Cake sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Full Interactive Calendar Coming Soon!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            We&apos;re working on a beautiful calendar view with character birthdays, event reminders, and more!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

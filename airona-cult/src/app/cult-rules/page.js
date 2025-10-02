"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";

const rules = [
  {
    id: 1,
    title: "Be Loyal to Airona",
    description: "Getting too lovey dovey about Tina or Rorola will be considered as blasphemy",
    sticker: "/airona/airona1.png",
    color: "#A6D86C",
  },
  {
    id: 2,
    title: "Daily Devotion",
    description: "Post PRAISE AIRONA or just airona proud sticker daily to show your dedication",
    sticker: "/airona/airona3.png",
    color: "#C7B7F9",
  },
  {
    id: 3,
    title: "Worship Together",
    description: "Participate in guild events to worship Airona together",
    sticker: "/airona/airona5.png",
    color: "#FFA726",
  },
  {
    id: 4,
    title: "No False Idols",
    description: "Airona is supreme. Comparisons to lesser waifus will not be entertained",
    sticker: "/airona/airona7.png",
    color: "#FF7043",
  },
  {
    id: 5,
    title: "Find New Believers",
    description: "Introduce new friends to Airona with patience and kindness until they see the light",
    sticker: "/airona/airona9.png",
    color: "#66BB6A",
  },
  {
    id: 6,
    title: "Speak Her Name with Reverence",
    description: "Airona is never to be insulted. Disrespecting her is heresy",
    sticker: "/airona/airona10.png",
    color: "#AB47BC",
  },
];

export default function CultRulesPage() {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Box sx={{ position: "relative", mb: 3, display: "flex", justifyContent: "center" }}>
          <Image
            src="/airona/airona_logo.png"
            alt="Airona Logo"
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              border: `4px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          />
        </Box>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: "bold",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          Airona Cult Special Rules
        </Typography>
        <Typography variant="h5" color="textSecondary" sx={{ fontStyle: "italic" }}>
          Sacred commandments for all devoted followers
        </Typography>
        <Chip 
          label="✨ PRAISE AIRONA ✨" 
          sx={{ 
            mt: 2, 
            fontSize: "1.1rem",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            fontWeight: "bold",
          }}
        />
      </Box>

      {/* Rules List */}
      {rules.map((rule, index) => (
        <Card 
          key={rule.id}
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(rule.color, 0.1)}, ${alpha(rule.color, 0.05)})`,
            border: `2px solid ${alpha(rule.color, 0.2)}`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 8px 25px ${alpha(rule.color, 0.3)}`,
              border: `2px solid ${alpha(rule.color, 0.4)}`,
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              mb: 2
            }}>
              <Box 
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: `linear-gradient(45deg, ${rule.color}, ${alpha(rule.color, 0.7)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {rule.id}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: "bold", 
                    color: rule.color,
                    mb: 1
                  }}
                >
                  {rule.title}
                </Typography>
              </Box>
              <Box sx={{ ml: 2, flexShrink: 0 }}>
                <Image
                  src={rule.sticker}
                  alt={`Airona sticker ${rule.id}`}
                  width={60}
                  height={60}
                  style={{
                    borderRadius: "8px",
                    border: `2px solid ${rule.color}`,
                  }}
                />
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {rule.description}
            </Typography>
          </CardContent>
        </Card>
      ))}

      {/* Footer Section */}
      <Box 
        textAlign="center" 
        sx={{ 
          mt: 6, 
          p: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Image
          src="/airona/airona2.png"
          alt="Airona blessing"
          width={80}
          height={80}
          style={{
            marginBottom: "16px",
            borderRadius: "50%",
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
          May Airona&apos;s Blessing Be Upon You! 
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ fontStyle: "italic" }}>
          Follow these sacred rules and prosper in coin and adventure! 💰✨
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label="🎯 Love Airona" sx={{ mr: 1, mb: 1 }} />
          <Chip label="💰 Like Airona" sx={{ mr: 1, mb: 1 }} />
          <Chip label="🌟 Hail Airona" sx={{ mb: 1 }} />
        </Box>
      </Box>
    </Container>
  );
}

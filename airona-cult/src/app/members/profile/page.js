"use client";

import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Chip,
  Divider,
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
} from "@mui/material";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const sampleData = {
  member: {
    username: "hibikineko",
    name: "Hibiki",
    role_priority: "Guild Leader",
  },
  guildCard: {
    class: "Oracle",
    avatar_url:
      "https://vjpdamnmnyxyihqxgceg.supabase.co/storage/v1/object/public/airona/airona_avatar.png",
    character_url:
      "https://vjpdamnmnyxyihqxgceg.supabase.co/storage/v1/object/public/airona/airona_profile.png",
    screenshots: [
      "https://vjpdamnmnyxyihqxgceg.supabase.co/storage/v1/object/public/airona/screen1.png",
      "https://vjpdamnmnyxyihqxgceg.supabase.co/storage/v1/object/public/airona/screen2.png",
      "https://vjpdamnmnyxyihqxgceg.supabase.co/storage/v1/object/public/airona/screen3.png",
    ],
    bio: `# 🌌 AIRONA CULT ✨  

> *"The sky holds secrets only dreamers can hear."*  

**Favorite Skills:**  
- 🌿 Herbalism  
- 🔮 Crystal Divinatio`,
    life_skill: { name: "Mining", colorLight: "#99ccff", colorDark: "#3366cc" },
    birthday: { name: "Sep 12", colorLight: "#cce0ff", colorDark: "#2244aa" },
    position: { name: "Guild Leader", colorLight: "#6699ff", colorDark: "#112288" },
    classChip: {
      backgroundLight: "#cce0ff",
      backgroundDark: "#223366",
      textLight: "#003366",
      textDark: "#ffffff",
      borderLight: "2px solid #3399ff",
      borderDark: "2px solid #112288",
    },
    avatarBorder: { width: "4px", colorLight: "#3399ff", colorDark: "#112288" },
    characterBox: {
      backgroundLight: "rgba(204,224,255,0.2)",
      backgroundDark: "rgba(34,51,102,0.25)",
      borderLight: "1px solid rgba(51,153,255,0.4)",
      borderDark: "1px solid rgba(17,34,136,0.4)",
    },
    theme: {
      light: "linear-gradient(135deg, #e6f0ff, #99ccff)",
      dark: "linear-gradient(135deg, #223366, #3366cc)",
    },
    cardBackground: {
      light: "#dde6ff",
      dark: "#112244",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#3366cc", hover: "#cce0ff" },
        unselected: { bg: "#cce0ff", color: "#003366", hover: "#99ccff" },
      },
      dark: {
        selected: { bg: "#3366cc", color: "#ffffff", hover: "#6699ff" },
        unselected: { bg: "#223366", color: "#ccccff", hover: "#3366cc" },
      },
    },
  },
};

const sampleComments = [
  { name: "GuildMate 1", text: "Always helping out with herbs 🌿" },
  { name: "GuildMate 2", text: "Her magic is unmatched in duels!" },
  { name: "GuildMate 3", text: "Sweet soul, always there for the guild 💜" },
];

export default function GuildProfileCard() {
  const { member, guildCard } = sampleData;
  const [openSection, setOpenSection] = useState(null);
  const [frosted, setFrosted] = useState(true);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100vh",
        background: (theme) =>
          theme.palette.mode === "light"
            ? guildCard.theme.light
            : guildCard.theme.dark,
      }}
    >
      <FormControlLabel
        sx={{ mb: 2 }}
        control={
          <Switch
            checked={frosted}
            onChange={(e) => setFrosted(e.target.checked)}
          />
        }
        label="Enable Frosted Glass"
      />

      <Card
        sx={{
          maxWidth: 1100,
          margin: "auto",
          mt: 4,
          borderRadius: "24px",
          background: (theme) =>
            frosted
              ? theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(30, 30, 50, 0.25)"
              : theme.palette.mode === "light"
              ? guildCard.cardBackground.light
              : guildCard.cardBackground.dark,
          backdropFilter: frosted
            ? "blur(20px) saturate(160%) brightness(120%)"
            : "none",
          border: frosted ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
          boxShadow: frosted
            ? "0 8px 32px rgba(0,0,0,0.35)"
            : "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Grid container spacing={2} alignItems="stretch">
          <Grid
            item
            xs={12}
            md={7}
            sx={{ display: "flex", flexDirection: "column", minWidth: { md: 450 } }}
          >
            <Box textAlign="center" p={3}>
              <Avatar
                src={guildCard.avatar_url}
                alt={member.username}
                sx={{
                  width: 120,
                  height: 120,
                  margin: "auto",
                  border: `${guildCard.avatarBorder.width} solid ${
                    guildCard.avatarBorder.colorLight
                  }`,
                  borderColor: (theme) =>
                    theme.palette.mode === "light"
                      ? guildCard.avatarBorder.colorLight
                      : guildCard.avatarBorder.colorDark,
                }}
              />
              <Typography variant="h5" mt={2}>
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{member.username}
              </Typography>
              <Chip
                label={guildCard.class}
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? guildCard.classChip.backgroundLight
                      : guildCard.classChip.backgroundDark,
                  color: (theme) =>
                    theme.palette.mode === "light"
                      ? guildCard.classChip.textLight
                      : guildCard.classChip.textDark,
                  border: (theme) =>
                    theme.palette.mode === "light"
                      ? guildCard.classChip.borderLight
                      : guildCard.classChip.borderDark,
                }}
              />
            </Box>

            <CardContent
              sx={{
                mx: 2,
                mb: 2,
                borderRadius: "16px",
                background: frosted ? "rgba(255, 255, 255, 0.3)" : "transparent",
                backdropFilter: frosted ? "blur(12px)" : "none",
                border: frosted ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <Typography
                      variant="body1"
                      paragraph
                      sx={{ whiteSpace: "pre-wrap" }}
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <Typography component="span" fontWeight="bold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <Typography component="span" fontStyle="italic" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li>
                      <Typography component="span" variant="body2" {...props} />
                    </li>
                  ),
                }}
              >
                {guildCard.bio.length > 400
                  ? guildCard.bio.substring(0, 400)
                  : guildCard.bio}
              </ReactMarkdown>
            </CardContent>

            <Divider sx={{ my: 2 }} />
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1.5}
              px={2}
              mb={2}
              justifyContent="center"
            >
              {[ 
                { item: guildCard.life_skill, label: "🌿 Life Skill: " },
                { item: guildCard.birthday, label: "🎂 Birthday: " },
                { item: guildCard.position, label: "⭐ Position: " },
              ].map(({ item, label }, index) => (
                <Chip
                  key={index}
                  label={`${label}${item.name}`}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "16px",
                    fontWeight: "bold",
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? item.colorLight
                        : item.colorDark,
                    color: "white",
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
              alignItems: "center",
              p: { xs: 2, md: 3 },
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: "24px",
                p: 1.5,
                background: (theme) =>
                  frosted
                    ? theme.palette.mode === "light"
                      ? guildCard.characterBox.backgroundLight
                      : guildCard.characterBox.backgroundDark
                    : theme.palette.mode === "light"
                    ? guildCard.cardBackground.light
                    : guildCard.cardBackground.dark,
                border: (theme) =>
                  frosted
                    ? theme.palette.mode === "light"
                      ? guildCard.characterBox.borderLight
                      : guildCard.characterBox.borderDark
                    : "none",
                backdropFilter: frosted ? "blur(20px) saturate(160%)" : "none",
                boxShadow: frosted
                  ? "0 6px 20px rgba(0,0,0,0.25)"
                  : "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Box
                component="img"
                src={guildCard.character_url}
                alt="In-game character"
                sx={{
                  maxHeight: { xs: 320, md: 500 },
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "20px",
                  display: "block",
                  mx: "auto",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          px={2}
          pb={3}
          justifyContent="center"
        >
          {["lore", "screenshots", "comments"].map((section) => (
            <Button
              key={section}
              variant="contained"
              onClick={() => toggleSection(section)}
              sx={{
                backgroundColor: (theme) => {
                  const mode = theme.palette.mode;
                  return openSection === section
                    ? guildCard.buttons[mode].selected.bg
                    : guildCard.buttons[mode].unselected.bg;
                },
                color: (theme) => {
                  const mode = theme.palette.mode;
                  return openSection === section
                    ? guildCard.buttons[mode].selected.color
                    : guildCard.buttons[mode].unselected.color;
                },
                "&:hover": (theme) => {
                  const mode = theme.palette.mode;
                  return {
                    backgroundColor: openSection === section
                      ? guildCard.buttons[mode].selected.hover
                      : guildCard.buttons[mode].unselected.hover,
                  };
                },
              }}
            >
              {section === "lore"
                ? "View Lore"
                : section === "screenshots"
                ? "View Screenshots"
                : "View Comments"}
            </Button>
          ))}
        </Box>
      </Card>

      {/* Collapsible sections */}
      <Collapse in={openSection === "lore"} timeout="auto" unmountOnExit>
        <Box
          sx={{
            maxWidth: 1000,
            margin: "20px auto",
            p: 3,
            borderRadius: "20px",
            backgroundColor: "background.paper",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Lore
          </Typography>
          <Typography variant="body1">
            Lyria was born under a comet’s light and blessed with the gift of
            whispering to stars. She wanders the world seeking magical stories
            to record in her grimoire.
          </Typography>
        </Box>
      </Collapse>

      <Collapse in={openSection === "screenshots"} timeout="auto" unmountOnExit>
        <Box
          sx={{
            maxWidth: 1000,
            margin: "20px auto",
            p: 3,
            borderRadius: "20px",
            backgroundColor: "background.paper",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {guildCard.screenshots.map((url, idx) => (
            <Box
              key={idx}
              component="img"
              src={url}
              alt={`Screenshot ${idx + 1}`}
              sx={{
                width: { xs: "80%", md: "30%" },
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
          ))}
        </Box>
      </Collapse>

      <Collapse in={openSection === "comments"} timeout="auto" unmountOnExit>
        <Box
          sx={{
            maxWidth: 1000,
            margin: "20px auto",
            p: 3,
            borderRadius: "20px",
            backgroundColor: "background.paper",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Comments
          </Typography>
          <List>
            {sampleComments.map((c, i) => (
              <ListItem key={i} divider>
                <ListItemText
                  primary={c.text}
                  secondary={`— ${c.name}`}
                  primaryTypographyProps={{ variant: "body1" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>
    </Box>
  );
}

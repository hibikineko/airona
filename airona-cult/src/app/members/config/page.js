"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Drawer,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import ReactMarkdown from "react-markdown";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const sampleData = {
  member: { username: "hibikineko", name: "Hibiki", role_priority: "Guild Leader" },
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
    bio: "# 🌌 AIRONA CULT ✨  \n> *\"The sky holds secrets only dreamers can hear.\"*",
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
    theme: { light: "linear-gradient(135deg, #e6f0ff, #99ccff)", dark: "linear-gradient(135deg, #223366, #3366cc)" },
    cardBackground: { light: "#dde6ff", dark: "#112244" },
    buttons: {
      light: { selected: { bg: "#ffffff", color: "#3366cc", hover: "#cce0ff" }, unselected: { bg: "#cce0ff", color: "#003366", hover: "#99ccff" } },
      dark: { selected: { bg: "#3366cc", color: "#ffffff", hover: "#6699ff" }, unselected: { bg: "#223366", color: "#ccccff", hover: "#3366cc" } },
    },
  },
};

const sampleComments = [
  { name: "GuildMate 1", text: "Always helping out with herbs 🌿" },
  { name: "GuildMate 2", text: "Her magic is unmatched in duels!" },
  { name: "GuildMate 3", text: "Sweet soul, always there for the guild 💜" },
];

const predefinedThemes = [
  {
    name: "Cherry Blossom",
    theme: {
      light: "linear-gradient(135deg, #ffe6f0, #ff99cc)",
      dark: "linear-gradient(135deg, #440033, #cc3399)",
    },
    cardBackground: { light: "#fff0f5", dark: "#221122" },
    classChip: {
      backgroundLight: "#ffd6e8",
      backgroundDark: "#662255",
      textLight: "#660033",
      textDark: "#ffffff", // white text for dark mode
      borderLight: "2px solid #ff99cc",
      borderDark: "2px solid #cc3399",
    },
    avatarBorder: { width: "4px", colorLight: "#ff99cc", colorDark: "#cc3399" },
    characterBox: {
      backgroundLight: "rgba(255,214,232,0.2)",
      backgroundDark: "rgba(102,34,85,0.25)",
      borderLight: "1px solid rgba(255,153,204,0.4)",
      borderDark: "1px solid rgba(204,51,153,0.4)",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#ff66aa", hover: "#ffcce0" },
        unselected: { bg: "#ffd6e8", color: "#660033", hover: "#ff99cc" },
      },
      dark: {
        selected: { bg: "#cc3399", color: "#ffffff", hover: "#ff66aa" },
        unselected: { bg: "#662255", color: "#ffffff", hover: "#cc3399" }, // white text
      },
    },
  },
  {
    name: "Ice Crystal",
    theme: {
      light: "linear-gradient(135deg, #e0f7ff, #99ddff)",
      dark: "linear-gradient(135deg, #112244, #3399cc)",
    },
    cardBackground: { light: "#ddf0ff", dark: "#112244" },
    classChip: {
      backgroundLight: "#cceeff",
      backgroundDark: "#223366",
      textLight: "#003366",
      textDark: "#ffffff",
      borderLight: "2px solid #3399ff",
      borderDark: "2px solid #112288",
    },
    avatarBorder: { width: "4px", colorLight: "#3399ff", colorDark: "#112288" },
    characterBox: {
      backgroundLight: "rgba(204,238,255,0.2)",
      backgroundDark: "rgba(34,51,102,0.25)",
      borderLight: "1px solid rgba(51,153,255,0.4)",
      borderDark: "1px solid rgba(17,34,136,0.4)",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#3366cc", hover: "#cce0ff" },
        unselected: { bg: "#cce0ff", color: "#003366", hover: "#99ccff" },
      },
      dark: {
        selected: { bg: "#3366cc", color: "#ffffff", hover: "#6699ff" },
        unselected: { bg: "#223366", color: "#ffffff", hover: "#3366cc" }, // white text
      },
    },
  },
  {
    name: "Sun & Moon",
    theme: {
      light: "linear-gradient(135deg, #fff2cc, #ffcc66)",
      dark: "linear-gradient(135deg, #332244, #996633)",
    },
    cardBackground: { light: "#fff8e6", dark: "#221122" },
    classChip: {
      backgroundLight: "#ffe0a3",
      backgroundDark: "#663322",
      textLight: "#663300",
      textDark: "#ffffff",
      borderLight: "2px solid #ffcc66",
      borderDark: "2px solid #996633",
    },
    avatarBorder: { width: "4px", colorLight: "#ffcc66", colorDark: "#996633" },
    characterBox: {
      backgroundLight: "rgba(255,224,163,0.2)",
      backgroundDark: "rgba(102,51,34,0.25)",
      borderLight: "1px solid rgba(255,204,102,0.4)",
      borderDark: "1px solid rgba(153,102,51,0.4)",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#ff9933", hover: "#ffe0b3" },
        unselected: { bg: "#ffe0a3", color: "#663300", hover: "#ffcc66" },
      },
      dark: {
        selected: { bg: "#996633", color: "#ffffff", hover: "#cc9933" },
        unselected: { bg: "#663322", color: "#ffffff", hover: "#996633" },
      },
    },
  },
  {
    name: "Forest Grove",
    theme: {
      light: "linear-gradient(135deg, #e6ffe6, #66cc66)",
      dark: "linear-gradient(135deg, #113322, #339966)",
    },
    cardBackground: { light: "#f0fff0", dark: "#112211" },
    classChip: {
      backgroundLight: "#ccffcc",
      backgroundDark: "#224422",
      textLight: "#006600",
      textDark: "#ffffff",
      borderLight: "2px solid #66cc66",
      borderDark: "2px solid #339966",
    },
    avatarBorder: { width: "4px", colorLight: "#66cc66", colorDark: "#339966" },
    characterBox: {
      backgroundLight: "rgba(204,255,204,0.2)",
      backgroundDark: "rgba(34,68,34,0.25)",
      borderLight: "1px solid rgba(102,204,102,0.4)",
      borderDark: "1px solid rgba(51,153,102,0.4)",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#339933", hover: "#ccffcc" },
        unselected: { bg: "#ccffcc", color: "#006600", hover: "#66cc66" },
      },
      dark: {
        selected: { bg: "#339966", color: "#ffffff", hover: "#66cc66" },
        unselected: { bg: "#224422", color: "#ffffff", hover: "#339966" },
      },
    },
  },
  {
    name: "Twilight Violet",
    theme: {
      light: "linear-gradient(135deg, #f2e6ff, #cc99ff)",
      dark: "linear-gradient(135deg, #221144, #6633cc)",
    },
    cardBackground: { light: "#f9f0ff", dark: "#110022" },
    classChip: {
      backgroundLight: "#e6ccff",
      backgroundDark: "#332266",
      textLight: "#330066",
      textDark: "#ffffff",
      borderLight: "2px solid #cc99ff",
      borderDark: "2px solid #6633cc",
    },
    avatarBorder: { width: "4px", colorLight: "#cc99ff", colorDark: "#6633cc" },
    characterBox: {
      backgroundLight: "rgba(230,204,255,0.2)",
      backgroundDark: "rgba(51,34,102,0.25)",
      borderLight: "1px solid rgba(204,153,255,0.4)",
      borderDark: "1px solid rgba(102,51,204,0.4)",
    },
    buttons: {
      light: {
        selected: { bg: "#ffffff", color: "#9933ff", hover: "#e6ccff" },
        unselected: { bg: "#e6ccff", color: "#330066", hover: "#cc99ff" },
      },
      dark: {
        selected: { bg: "#6633cc", color: "#ffffff", hover: "#9933ff" },
        unselected: { bg: "#332266", color: "#ffffff", hover: "#6633cc" },
      },
    },
  },
];




export default function GuildCardPage() {
  const [guildCard, setGuildCard] = useState(sampleData.guildCard);
  const [frosted, setFrosted] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [pickerOpen, setPickerOpen] = useState({});
  const [openSection, setOpenSection] = useState(null);

  const togglePicker = (field) => setPickerOpen((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setGuildCard((prev) => {
      let obj = { ...prev };
      let temp = obj;
      keys.forEach((k, i) => (i === keys.length - 1 ? (temp[k] = value) : (temp = temp[k])));
      return obj;
    });
  };

  const renderColorField = (label, path) => (
    <Box sx={{ mt: 1 }}>
        
      <TextField
        fullWidth
        label={label}
        value={path.split(".").reduce((a, b) => a[b], guildCard)}
        onChange={(e) => handleChange(path, e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => togglePicker(path)}>
                <ColorLensIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {pickerOpen[path] && (
        <HexColorPicker
          color={path.split(".").reduce((a, b) => a[b], guildCard)}
          onChange={(c) => handleChange(path, c)}
        />
      )}
    </Box>
  );

  const toggleSection = (section) => setOpenSection(openSection === section ? null : section);

  return (
   <Box
        sx={{
            p: 2,
            minHeight: "100vh",
            background: theme =>
            theme.palette.mode === "light" ? guildCard.theme.light : guildCard.theme.dark,
        }}
        >

      <Button variant="contained" onClick={() => setOpenDrawer(true)} sx={{ mb: 2 }}>
        Open Config
      </Button>

      {/* Preview */}
      <Box>
        <Card
            sx={{
                maxWidth: 1100,
                margin: "auto",
                mt: 2,
                borderRadius: "24px",
                background: frosted
                ? theme => `rgba(${theme.palette.mode === "light" ? "255, 255, 255" : "30, 30, 50"}, 0.15)`
                : theme => theme.palette.mode === "light" ? guildCard.cardBackground.light : guildCard.cardBackground.dark,
                backdropFilter: frosted ? "blur(20px) saturate(160%) brightness(120%)" : "none",
                border: frosted ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
                boxShadow: frosted
                ? "0 8px 32px rgba(0,0,0,0.35)"
                : "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
            }}
            >
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", minWidth: { md: 450 } }}>
              <Box textAlign="center" p={3}>
                <Avatar
                  src={guildCard.avatar_url}
                  alt={sampleData.member.username}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: "auto",
                    border: `${guildCard.avatarBorder.width} solid ${guildCard.avatarBorder.colorLight}`,
                    borderColor: theme =>
                    theme.palette.mode === "light"
                        ? guildCard.avatarBorder.colorLight
                        : guildCard.avatarBorder.colorDark,
                  }}
                />
                <Typography variant="h5" mt={2}>{sampleData.member.name}</Typography>
                <Typography variant="body2" color="text.secondary">@{sampleData.member.username}</Typography>
                <Chip
                    label={guildCard.class}
                    sx={{
                        mt: 1,
                        fontWeight: 600,
                        background: theme =>
                        theme.palette.mode === "light"
                            ? guildCard.classChip.backgroundLight
                            : guildCard.classChip.backgroundDark,
                        color: theme =>
                        theme.palette.mode === "light"
                            ? guildCard.classChip.textLight
                            : guildCard.classChip.textDark,
                        border: theme =>
                        theme.palette.mode === "light"
                            ? guildCard.classChip.borderLight
                            : guildCard.classChip.borderDark,
                    }}
                    />

              </Box>

              <CardContent sx={{ mx: 2, mb: 2, borderRadius: "16px", maxHeight: 380, overflowY: "auto", background: frosted ? "rgba(255,255,255,0.3)" : "transparent" }}>
                <Typography variant="h6" gutterBottom>About</Typography>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <Typography variant="body1" paragraph sx={{ whiteSpace: "pre-wrap" }} {...props} />,
                    strong: ({ node, ...props }) => <Typography component="span" fontWeight="bold" {...props} />,
                    em: ({ node, ...props }) => <Typography component="span" fontStyle="italic" {...props} />,
                    li: ({ node, ...props }) => <li><Typography component="span" variant="body2" {...props} /></li>,
                  }}
                >
                  {guildCard.bio}
                </ReactMarkdown>
              </CardContent>

              <Divider sx={{ my: 2 }} />
              <Box display="flex" flexWrap="wrap" gap={1.5} px={2} mb={2} justifyContent="center">
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
                        background: theme =>
                            theme.palette.mode === "light" ? item.colorLight : item.colorDark,
                        color: "white",
                        }}
                    />
                    ))}

              </Box>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: { xs: 2, md: 3 } }}>
              <Box sx={{ position: "relative", borderRadius: "24px", p: 1.5, background: theme =>
                            frosted
                                ? theme.palette.mode === "light"
                                ? guildCard.characterBox.backgroundLight
                                : guildCard.characterBox.backgroundDark
                                : theme.palette.mode === "light"
                                ? guildCard.cardBackground.light
                                : guildCard.cardBackground.dark,
                            border: theme =>
                            frosted
                                ? theme.palette.mode === "light"
                                ? guildCard.characterBox.borderLight
                                : guildCard.characterBox.borderDark
                                : "none",
                             backdropFilter: frosted ? "blur(20px) saturate(160%)" : "none", boxShadow: frosted ? "0 6px 20px rgba(0,0,0,0.25)" : "0 2px 10px rgba(0,0,0,0.1)" }}>
                <Box component="img" src={guildCard.character_url} alt="Character" sx={{ maxHeight: { xs: 320, md: 500 }, width: "auto", maxWidth: "100%", objectFit: "contain", borderRadius: "20px", display: "block", mx: "auto" }} />
              </Box>
            </Grid>
          </Grid>

          <Box display="flex" gap={2} flexWrap="wrap" px={2} pb={3} justifyContent="center">
            {["lore", "screenshots", "comments"].map((section) => (
              <Button key={section} variant="contained" onClick={() => toggleSection(section)}>
                {section === "lore" ? "View Lore" : section === "screenshots" ? "View Screenshots" : "View Comments"}
              </Button>
            ))}
          </Box>
        </Card>

        {/* Collapsibles */}
        <Collapse in={openSection === "lore"} timeout="auto" unmountOnExit>
          <Box sx={{ maxWidth: 1000, margin: "20px auto", p: 3, borderRadius: "20px", backgroundColor: "background.paper", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
            <Typography variant="h6" gutterBottom>Lore</Typography>
            <Typography variant="body1">
              Lyria was born under a comet’s light and blessed with the gift of whispering to stars.
            </Typography>
          </Box>
        </Collapse>

        <Collapse in={openSection === "screenshots"} timeout="auto" unmountOnExit>
          <Box sx={{ maxWidth: 1000, margin: "20px auto", p: 3, borderRadius: "20px", backgroundColor: "background.paper", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
            {guildCard.screenshots.map((url, idx) => (
              <Box key={idx} component="img" src={url} alt={`Screenshot ${idx + 1}`} sx={{ width: { xs: "80%", md: "30%" }, borderRadius: "12px", objectFit: "cover" }} />
            ))}
          </Box>
        </Collapse>

        <Collapse in={openSection === "comments"} timeout="auto" unmountOnExit>
          <Box sx={{ maxWidth: 1000, margin: "20px auto", p: 3, borderRadius: "20px", backgroundColor: "background.paper", boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
            <Typography variant="h6" gutterBottom>Comments</Typography>
            <List>
              {sampleComments.map((c, i) => (
                <ListItem key={i} divider>
                  <ListItemText primary={c.text} secondary={`— ${c.name}`} primaryTypographyProps={{ variant: "body1" }} secondaryTypographyProps={{ variant: "caption" }} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      </Box>

      {/* Config Drawer */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box sx={{ width: 360, p: 2 }}>
          <Typography variant="h6" mb={2}>Card Configuration</Typography>
          <FormControlLabel control={<Switch checked={frosted} onChange={(e) => setFrosted(e.target.checked)} />} label="Enable Frosted Glass" />
          // In Drawer JSX
            <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Predefined Theme</InputLabel>
            <Select
                value={guildCard.themeName || ""}
                label="Predefined Theme"
                onChange={(e) => {
                const selectedTheme = predefinedThemes.find(t => t.name === e.target.value);
                if (selectedTheme) {
                    setGuildCard(prev => ({
                    ...prev,
                    ...selectedTheme,
                    themeName: selectedTheme.name,
                    }));
                }
                }}
            >
                {predefinedThemes.map((t) => (
                <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                ))}
            </Select>
            </FormControl>
          <TextField fullWidth label="Class" value={guildCard.class} onChange={(e) => handleChange("class", e.target.value)} sx={{ mt: 2 }} />
          <TextField fullWidth label="Bio" multiline rows={6} value={guildCard.bio} onChange={(e) => handleChange("bio", e.target.value)} sx={{ mt: 2 }} />
          
          {/* Life Skill */}
          <TextField fullWidth label="Life Skill" value={guildCard.life_skill.name} onChange={(e) => handleChange("life_skill.name", e.target.value)} sx={{ mt: 2 }} />
          {renderColorField("Life Skill Color Light", "life_skill.colorLight")}
          {renderColorField("Life Skill Color Dark", "life_skill.colorDark")}

          {/* Birthday */}
          <TextField fullWidth label="Birthday" value={guildCard.birthday.name} onChange={(e) => handleChange("birthday.name", e.target.value)} sx={{ mt: 2 }} />
          {renderColorField("Birthday Color Light", "birthday.colorLight")}
          {renderColorField("Birthday Color Dark", "birthday.colorDark")}

          {/* Position */}
          <TextField fullWidth label="Position" value={guildCard.position.name} onChange={(e) => handleChange("position.name", e.target.value)} sx={{ mt: 2 }} />
          {renderColorField("Position Color Light", "position.colorLight")}
          {renderColorField("Position Color Dark", "position.colorDark")}

          {/* Class Chip */}
          <TextField fullWidth label="Class Chip Background Light" value={guildCard.classChip.backgroundLight} onChange={(e) => handleChange("classChip.backgroundLight", e.target.value)} sx={{ mt: 2 }} />
          <TextField fullWidth label="Class Chip Background Dark" value={guildCard.classChip.backgroundDark} onChange={(e) => handleChange("classChip.backgroundDark", e.target.value)} sx={{ mt: 1 }} />
          <TextField fullWidth label="Class Chip Text Light" value={guildCard.classChip.textLight} onChange={(e) => handleChange("classChip.textLight", e.target.value)} sx={{ mt: 1 }} />
          <TextField fullWidth label="Class Chip Text Dark" value={guildCard.classChip.textDark} onChange={(e) => handleChange("classChip.textDark", e.target.value)} sx={{ mt: 1 }} />
          <TextField fullWidth label="Class Chip Border Light" value={guildCard.classChip.borderLight} onChange={(e) => handleChange("classChip.borderLight", e.target.value)} sx={{ mt: 1 }} />
          <TextField fullWidth label="Class Chip Border Dark" value={guildCard.classChip.borderDark} onChange={(e) => handleChange("classChip.borderDark", e.target.value)} sx={{ mt: 1 }} />

          {/* Avatar Border */}
          <TextField fullWidth label="Avatar Border Width" value={guildCard.avatarBorder.width} onChange={(e) => handleChange("avatarBorder.width", e.target.value)} sx={{ mt: 2 }} />
          {renderColorField("Avatar Border Color Light", "avatarBorder.colorLight")}
          {renderColorField("Avatar Border Color Dark", "avatarBorder.colorDark")}

          {/* Character Box */}
          {renderColorField("Character Box Background Light", "characterBox.backgroundLight")}
          {renderColorField("Character Box Background Dark", "characterBox.backgroundDark")}
          {renderColorField("Character Box Border Light", "characterBox.borderLight")}
          {renderColorField("Character Box Border Dark", "characterBox.borderDark")}

          {/* Theme */}
          {renderColorField("Theme Light", "theme.light")}
          {renderColorField("Theme Dark", "theme.dark")}

          {/* Card Background */}
          {renderColorField("Card Background Light", "cardBackground.light")}
          {renderColorField("Card Background Dark", "cardBackground.dark")}

          {/* Buttons */}
          {["selected", "unselected"].map((type) =>
            ["light", "dark"].map((mode) => (
              <Box key={`${type}-${mode}`}>
                <Typography variant="subtitle2" mt={2}>{`${mode} ${type} Button`}</Typography>
                {renderColorField("Button BG", `buttons.${mode}.${type}.bg`)}
                {renderColorField("Button Color", `buttons.${mode}.${type}.color`)}
                {renderColorField("Button Hover", `buttons.${mode}.${type}.hover`)}
              </Box>
            ))
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

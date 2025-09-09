"use client";

import { Box, Typography, Button, Link } from "@mui/material";
import Image from "next/image";

export default function OfflinePage() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        bgcolor: "#f5f5f5",
        px: 2,
      }}
    >
      {/* Airona sticker */}
      <Box sx={{ mb: 4, width: 150, height: 150, position: "relative" }}>
        <Image
          src="/airona/airona3.png"
          alt="Airona Cry Sticker"
          fill
          style={{ objectFit: "contain" }}
        />
      </Box>

      {/* Title */}
      <Typography variant="h3" gutterBottom>
        🚧 Site Under Maintenance
      </Typography>

      {/* Message */}
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2, maxWidth: 400 }}>
        Hey there! The site is currently offline for maintenance. We’ll be back soon!
      </Typography>

      {/* Contact info */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        For more info, contact{" "}
        <Link href="https://discord.com/users/275152997498224641" target="_blank" underline="hover">
          hibikineko
        </Link>{" "}
        on Discord
      </Typography>

      {/* Optional refresh button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
      >
        Refresh
      </Button>
    </Box>
  );
}
"use client";

import { Button } from "@mui/material";

export default function RitualButton({ onClick, children }) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      sx={{
        backgroundColor: "#8b0000",
        color: "#fff",
        fontWeight: "bold",
        px: 4,
        py: 1.5,
        borderRadius: "8px",
        textShadow: "0 0 8px #ff0000, 0 0 12px #660000",
        boxShadow: "0 0 15px #ff0000, inset 0 0 10px #660000",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          backgroundColor: "#ff0000",
          boxShadow: "0 0 25px #ff3333, inset 0 0 15px #660000",
          transform: "scale(1.05)",
        },
      }}
    >
      {children || "Confirm"}
    </Button>
  );
}

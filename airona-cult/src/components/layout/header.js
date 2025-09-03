"use client";

import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Navbar from "./navbar";
import Image from "next/image";

export default function Header({ toggleMode }) {
    const theme = useTheme();

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                {/* Navbar on the left */}
                <Navbar />

                {/* Logo */}
                <Box sx={{ display: "flex", alignItems: "center", ml: 2, mr: 2 }}>
                    <Image
                        src="/airona/airona_logo.png"
                        alt="Airona Logo"
                        width={48}
                        height={48}
                        style={{ marginRight: 8 }}
                    />
                </Box>

                {/* Title */}
                <Typography
                    variant="h3"
                    sx={{ flexGrow: 1, fontWeight: "bold", letterSpacing: 2 }}
                >
                    Airona Cult
                </Typography>

                {/* Toggle Button */}
                <IconButton color="inherit" onClick={toggleMode}>
                    {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

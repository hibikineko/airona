"use client";

import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Navbar from "./navbar";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

export default function Header({ toggleMode }) {
    const theme = useTheme();
    const { data: session } = useSession();

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
                {/* Auth Button */}
                {!session ? (
                    <IconButton
                        color="inherit"
                        onClick={() => signIn("discord")}
                        title="Login with Discord"
                        sx={{ mr: 1 }}
                    >
                        <FaDiscord size={32} />
                    </IconButton>
                ) : (
                    <Box sx={{ position: "relative", mr: 1 }}>
                        <IconButton
                            color="inherit"
                            sx={{
                                p: 0,
                                borderRadius: "50%",
                                overflow: "hidden",
                                width: 40,
                                height: 40,
                            }}
                        >
                            <Image
                                unoptimized
                                src={session.user.image}
                                alt={session.user.name}
                                width={40}
                                height={40}
                                style={{ borderRadius: "50%" }}
                                onClick={() => signOut()}
                            />
                        </IconButton>
                        <style jsx>{`
                            .logout-menu {
                                transition: display 0.2s;
                            }
                            div:hover > .logout-menu {
                                display: block !important;
                            }
                        `}</style>
                    </Box>
                )}
                <IconButton color="inherit" onClick={toggleMode}>
                    {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}

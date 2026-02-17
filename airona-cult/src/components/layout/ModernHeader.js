"use client";

import { useState } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme
} from "@mui/material";
import { 
  Brightness4, 
  Brightness7, 
  Menu as MenuIcon,
  Close as CloseIcon,
  SportsEsports,
  PhotoLibrary,
  Group,
  Home
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

const mainNavItems = [
  { name: "Home", path: "/", icon: <Home /> },
  { name: "Airona", path: "/airona", icon: <Group /> },
  { name: "BPSR", path: "/bpsr", icon: <SportsEsports /> },
  { name: "Gallery", path: "/gallery", icon: <PhotoLibrary /> },
  { name: "Memory Game", path: "/game/card", icon: <SportsEsports /> },
];

export default function ModernHeader({ toggleMode }) {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const { data: session } = useSession();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  // Desktop navigation
  const DesktopNav = () => (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
      {mainNavItems.map((item) => (
        <Button
          key={item.name}
          component={Link}
          href={item.path}
          startIcon={item.icon}
          sx={{
            color: "white",
            px: 2,
            py: 1,
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "1.05rem",
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, system-ui",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.15)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {item.name}
        </Button>
      ))}
    </Box>
  );

  // Mobile drawer
  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          width: 280,
          background: theme.palette.mode === "light" ? "#fff" : "#1a1a1a",
          borderRadius: "24px 0 0 24px",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, system-ui",
              fontSize: "1.3rem",
            }}
          >
            Menu
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List>
          {mainNavItems.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={toggleDrawer}
                sx={{
                  borderRadius: "12px",
                  "&:hover": {
                    background: theme.palette.mode === "light" 
                      ? "rgba(140, 194, 98, 0.1)" 
                      : "rgba(166, 216, 108, 0.1)",
                  },
                }}
              >
                {item.icon}
                <ListItemText 
                  primary={item.name} 
                  sx={{ 
                    ml: 2,
                    '& .MuiTypography-root': {
                      fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, system-ui",
                      fontSize: "1.05rem",
                      fontWeight: 500,
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: theme.palette.mode === "light"
            ? "linear-gradient(135deg, #8DC262 0%, #A6D86C 100%)"
            : "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${
            theme.palette.mode === "light" 
              ? "rgba(255, 255, 255, 0.3)" 
              : "rgba(255, 255, 255, 0.1)"
          }`,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo and Title */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              textDecoration: "none",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <Image
                src="/airona/airona_logo.png"
                alt="Airona Logo"
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "white",
                letterSpacing: "1.5px",
                display: { xs: "none", sm: "block" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, system-ui",
                fontSize: { sm: "1.75rem", md: "2rem" },
              }}
            >
              AironaCult
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Auth Button */}
            {!session ? (
              <Button
                startIcon={<FaDiscord />}
                onClick={() => signIn("discord")}
                sx={{
                  color: "white",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, system-ui",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.25)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "block" } }}>Login</Box>
              </Button>
            ) : (
              <IconButton
                onClick={() => signOut()}
                sx={{
                  p: 0,
                  borderRadius: "50%",
                  overflow: "hidden",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Image
                  unoptimized
                  src={session.user.image}
                  alt={session.user.name}
                  width={40}
                  height={40}
                />
              </IconButton>
            )}

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleMode}
              sx={{
                color: "white",
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(8px)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.25)",
                  transform: "rotate(180deg)",
                },
                transition: "all 0.5s ease",
              }}
            >
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={toggleDrawer}
                sx={{
                  color: "white",
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(8px)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.25)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawer />
    </>
  );
}

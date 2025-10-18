"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import StarIcon from "@mui/icons-material/Star";

const GradientBackground = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  minHeight: "100vh",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundImage: "url('/airona/popronagang.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: "20px",
  overflow: "hidden",
  minHeight: "500px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(4),
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(1px)",
  },
}));

const VideoCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(145deg, #ff6b9d, #c44569)",
  color: "white",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(255, 107, 157, 0.3)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 15px 40px rgba(255, 107, 157, 0.4)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: "linear-gradient(45deg, #ff6b9d, #c44569)",
  color: "white",
  fontWeight: "bold",
  margin: theme.spacing(0.5),
  "& .MuiChip-icon": {
    color: "white",
  },
}));

export default function PopronaPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes logoGlow {
          0% { filter: drop-shadow(4px 4px 8px rgba(255,107,157,0.5)); }
          100% { filter: drop-shadow(4px 4px 15px rgba(255,107,157,0.8)); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      
      <GradientBackground>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <HeroSection>
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              color: "white",
              p: 4,
            }}
          >
            {/* POP♡RONA Logo */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="/airona/popronalogo.png"
                alt="POP♡RONA Logo"
                style={{
                  height: "120px",
                  width: "auto",
                  filter: "drop-shadow(4px 4px 8px rgba(0,0,0,0.7))",
                  animation: "logoGlow 3s ease-in-out infinite alternate",
                }}
              />
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                animation: "fadeInUp 1s ease-out",
              }}
            >
              The Official Airona Cult Guild Band ✨
            </Typography>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 1, 
              flexWrap: "wrap",
              animation: "fadeInUp 1.5s ease-out"
            }}>
              <StyledChip icon={<MusicNoteIcon />} label="Guild Dance" />
              <StyledChip icon={<StarIcon />} label="Guild Band" />
              <StyledChip icon={<PlayArrowIcon />} label="New Release" />
            </Box>
          </Box>
          
          {/* Floating Musical Notes Animation */}
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              left: "10%",
              animation: "float 6s ease-in-out infinite",
              zIndex: 1,
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.3)" }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: "20%",
              right: "15%",
              animation: "float 8s ease-in-out infinite reverse",
              zIndex: 1,
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 30, color: "rgba(255,255,255,0.2)" }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "15%",
              left: "20%",
              animation: "float 7s ease-in-out infinite",
              zIndex: 1,
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 35, color: "rgba(255,255,255,0.25)" }} />
          </Box>
        </HeroSection>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Video Section */}
          <Grid item xs={12} lg={8}>
            <VideoCard>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    textAlign: "center",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  🎵 Music Video Premiere 🎵
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    textAlign: "center",
                    opacity: 0.9,
                  }}
                >
                  POP♡RONA Manager Elysia made a beautiful music video for us!
                </Typography>
                
                <Box
                  sx={{
                    position: "relative",
                    paddingBottom: "56.25%", // 16:9 aspect ratio
                    height: 0,
                    borderRadius: "15px",
                    overflow: "hidden",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                  }}
                >
                  <iframe
                    src="https://www.youtube.com/embed/hb66aBMNKaQ"
                    title="POP♡RONA Music Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                    onLoad={() => setVideoLoaded(true)}
                  />
                  {!videoLoaded && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 40 }} />
                      <Typography variant="h6">Loading...</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </VideoCard>
          </Grid>

          {/* Info Section */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Logo in About Section */}
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <img
                    src="/airona/popronalogo.png"
                    alt="POP♡RONA Logo"
                    style={{
                      height: "80px",
                      width: "auto",
                      filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                </Box>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    background: "linear-gradient(45deg, #667eea, #764ba2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                  }}
                >
                  About POP♡RONA
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, textAlign: "center" }}>
                  POP♡RONA is the official guild band of Airona Cult, bringing together 
                  the most talented and passionate members to create amazing music that captures the 
                  spirit, energy, and love of our beloved community.
                </Typography>
                
                <Box sx={{ 
                  textAlign: "center", 
                  mb: 2, 
                  p: 2, 
                  backgroundColor: "rgba(255,107,157,0.1)", 
                  borderRadius: "10px",
                  border: "2px solid rgba(255,107,157,0.2)"
                }}>
                  <Typography variant="body2" sx={{ fontStyle: "italic", color: "#c44569", fontWeight: "bold" }}>
                    &quot;Music is the universal language of love, and POP♡RONA speaks it fluently!&quot; 🎵
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                  Band Manager
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, #ff6b9d, #c44569)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                      E
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Elysia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Creative Director & Manager
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  &quot;More exciting content and performances coming soon! Stay tuned for 
                  upcoming releases, behind-the-scenes content, and special events.&quot;
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Coming Soon Section */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "20px",
              p: 4,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              🎤 More Coming Soon! 🎤
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              We&apos;re working on exciting new content for POP♡RONA
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                  },
                }}
              >
                Dance Performances
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                  },
                }}
              >
                Band Members Page
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                  },
                }}
              >
                More Things
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
    </GradientBackground>
    </>
  );
}
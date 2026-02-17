"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  useTheme,
  IconButton,
  Dialog,
  Link as MuiLink,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close as CloseIcon } from "@mui/icons-material";
import Link from "next/link";

function AutoCarousel({ title, items = [], category, icon, onImageClick }) {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollButtons, 300);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const interval = setInterval(() => {
      if (scrollRef.current && canScrollRight) {
        scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
      setTimeout(checkScrollButtons, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [canScrollRight]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 8 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          <span>{icon}</span>
          {title}
        </Typography>
        <Button
          component={Link}
          href={`/gallery/${category}`}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          View More
        </Button>
      </Box>

      {/* Carousel Container */}
      <Box sx={{ position: "relative" }}>
        {/* Left Arrow */}
        {canScrollLeft && (
          <IconButton
            onClick={() => scroll("left")}
            sx={{
              position: "absolute",
              left: { xs: -12, sm: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 3,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}

        {/* Scrollable Content */}
        <Box
          ref={scrollRef}
          onScroll={checkScrollButtons}
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 3 },
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pb: 1,
          }}
        >
          {items.map((item, index) => (
            <Card
              key={index}
              sx={{
                minWidth: { xs: "280px", sm: "360px", md: "400px" },
                maxWidth: { xs: "280px", sm: "360px", md: "400px" },
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                transition: "all 0.3s ease",
              }}
            >
              <Box
                onClick={() => onImageClick(item.url || item.image_url)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                  transition: "transform 0.3s ease",
                }}
              >
                <img
                  src={item.url || item.image_url}
                  alt={item.title || item.alt || `${category} ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "360px",
                    objectFit: "cover",
                  }}
                />
              </Box>
              
              {/* Metadata Overlay for Fanart */}
              {category === "fanart" && (item.title || item.source || item.artist) && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)",
                    color: "white",
                    p: 2,
                  }}
                >
                  {item.title && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      {item.title}
                    </Typography>
                  )}
                  {item.artist && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        opacity: 0.9,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      Artist: {item.artist}
                    </Typography>
                  )}
                  {item.source && (
                    <MuiLink
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        display: "block",
                        color: "#8CC262",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "#6FA84C",
                        },
                        mt: 0.5,
                      }}
                    >
                      🔗 View Source
                    </MuiLink>
                  )}
                </Box>
              )}

              {/* Title Overlay for Screenshots/Sesbian */}
              {category !== "fanart" && item.title && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    color: "white",
                    p: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              )}
            </Card>
          ))}
        </Box>

        {/* Right Arrow */}
        {canScrollRight && (
          <IconButton
            onClick={() => scroll("right")}
            sx={{
              position: "absolute",
              right: { xs: -12, sm: -20 },
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 3,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ChevronRight />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export default function GalleryClient({ initialFanart = [], initialScreenshots = [], initialSesbian = [] }) {
  const [openImage, setOpenImage] = useState(null);

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Carousels */}
        <AutoCarousel
          title="Fanart"
          items={initialFanart}
          category="fanart"
          icon="🎨"
          onImageClick={setOpenImage}
        />
        <AutoCarousel
          title="Screenshots"
          items={initialScreenshots}
          category="screenshot"
          icon="📸"
          onImageClick={setOpenImage}
        />
        <AutoCarousel
          title="Sesbian"
          items={initialSesbian}
          category="sesbian"
          icon="💕"
          onImageClick={setOpenImage}
        />
      </Container>

      {/* Image Preview Dialog */}
      <Dialog 
        open={!!openImage} 
        onClose={() => setOpenImage(null)} 
        maxWidth="lg"
        PaperProps={{
          sx: {
            background: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <Box sx={{ position: "relative", bgcolor: "black" }}>
          <IconButton
            sx={{ 
              position: "absolute", 
              top: -50, 
              right: -10, 
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
              zIndex: 10 
            }}
            onClick={() => setOpenImage(null)}
          >
            <CloseIcon />
          </IconButton>
          {openImage && (
            <img
              src={openImage}
              alt="Large view"
              style={{
                maxWidth: "100vw",
                maxHeight: "100vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  alpha 
} from "@mui/material";
import { ChevronLeft, ChevronRight, FormatQuote } from "@mui/icons-material";

const reviews = [
  {
    id: 1,
    quote: "You can trust your soul to Airona",
    author: "Fragments",
    color: "#A6D86C",
  },
  {
    id: 2,
    quote: "Luno is fleeting, Airona Eternal!",
    author: "Mado",
    color: "#C7B7F9",
  },
  {
    id: 3,
    quote: "PRAISE AIRONA",
    author: "Hibiki",
    color: "#FFA726",
  },
];

export default function ReviewCarousel() {
  const theme = useTheme();
  const [currentReview, setCurrentReview] = useState(0);

  // Auto-rotate reviews every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <Card 
      sx={{
        background: `linear-gradient(135deg, ${alpha(reviews[currentReview].color, 0.1)}, ${alpha(reviews[currentReview].color, 0.05)})`,
        border: `2px solid ${alpha(reviews[currentReview].color, 0.2)}`,
        transition: "all 0.5s ease",
        position: "relative",
        overflow: "hidden",
        marginBottom: "3rem",
      }}
    >
      <CardContent style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "1rem"
        }}>
          <IconButton 
            onClick={prevReview}
            sx={{ 
              color: reviews[currentReview].color,
              "&:hover": { background: alpha(reviews[currentReview].color, 0.1) }
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <div style={{ flex: 1, padding: "0 1rem" }}>
            <FormatQuote 
              sx={{ 
                fontSize: 40, 
                color: reviews[currentReview].color,
                marginBottom: "0.5rem",
                transform: "rotate(180deg)"
              }} 
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontStyle: "italic",
                color: theme.palette.text.primary,
                marginBottom: "1rem",
                minHeight: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              &quot;{reviews[currentReview].quote}&quot;
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: "bold",
                color: reviews[currentReview].color,
              }}
            >
              - {reviews[currentReview].author}
            </Typography>
          </div>
          
          <IconButton 
            onClick={nextReview}
            sx={{ 
              color: reviews[currentReview].color,
              "&:hover": { background: alpha(reviews[currentReview].color, 0.1) }
            }}
          >
            <ChevronRight />
          </IconButton>
        </div>
        
        {/* Dots indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          {reviews.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentReview(index)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: index === currentReview 
                  ? reviews[currentReview].color 
                  : alpha(reviews[currentReview].color, 0.3),
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
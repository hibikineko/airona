"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingScreen({ onLoadingComplete }) {
  const [dots, setDots] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate loading dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    // Minimum loading time for smooth experience
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 600);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, [onLoadingComplete]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease-out",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles in background */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          right: "15%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: "rgba(166, 216, 108, 0.3)",
          animation: "float 3s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-20px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          left: "10%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(140, 194, 98, 0.3)",
          animation: "float 4s ease-in-out infinite 1s",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "20%",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(166, 216, 108, 0.2)",
          animation: "float 3.5s ease-in-out infinite 0.5s",
        }}
      />

      {/* Main card container with Airona */}
      <Box
        sx={{
          position: "relative",
          width: { xs: "280px", sm: "320px" },
          height: { xs: "280px", sm: "320px" },
          borderRadius: "32px",
          background: "linear-gradient(145deg, #8DC262, #A6D86C)",
          padding: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          animation: "scaleIn 0.6s ease-out",
          "@keyframes scaleIn": {
            "0%": { transform: "scale(0.8)", opacity: 0 },
            "100%": { transform: "scale(1)", opacity: 1 },
          },
        }}
      >
        {/* Corner decorations */}
        <Box
          sx={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#8DC262",
            border: "4px solid #fff",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#FFD700",
            border: "4px solid #fff",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "30%",
            right: "-10px",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            background: "#87CEEB",
            border: "4px solid #fff",
          }}
        />

        {/* Image container */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/airona/airona_happy.png"
            alt="Airona"
            width={240}
            height={240}
            style={{
              objectFit: "cover",
              animation: "bounce 2s ease-in-out infinite",
            }}
            priority
          />
        </Box>
      </Box>

      {/* Airona Cult Title */}
      <Typography
        variant="h3"
        sx={{
          mt: 4,
          fontWeight: 700,
          fontSize: { xs: "2.5rem", sm: "3rem" },
          color: "#fff",
          textShadow: "2px 4px 8px rgba(0,0,0,0.2)",
          letterSpacing: "2px",
          animation: "fadeInUp 0.8s ease-out 0.3s both",
          "@keyframes fadeInUp": {
            "0%": { transform: "translateY(20px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
        }}
      >
        AironaCult
      </Typography>

      {/* Loading text with animated dots */}
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: "#fff",
          fontWeight: 500,
          fontSize: { xs: "1rem", sm: "1.25rem" },
          animation: "fadeInUp 0.8s ease-out 0.5s both",
          minWidth: "120px",
          textAlign: "center",
        }}
      >
        LOADING{dots}
      </Typography>

      {/* Loading dots indicator */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mt: 2,
          animation: "fadeInUp 0.8s ease-out 0.7s both",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#fff",
              animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
              "@keyframes pulse": {
                "0%, 100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
                "50%": {
                  transform: "scale(1.3)",
                  opacity: 0.5,
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Bounce animation for the image */}
      <style jsx global>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </Box>
  );
}

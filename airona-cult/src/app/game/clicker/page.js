"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";

export default function AironaClicker() {
  const [luno, setLuno] = useState(0);
  const [coins, setCoins] = useState([]);

  // Load saved score
  useEffect(() => {
    const saved = localStorage.getItem("airona_luno");
    if (saved) setLuno(Number(saved));
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem("airona_luno", luno.toString());
  }, [luno]);

  const handleClick = () => {
    setLuno((prev) => prev + 1);

    // spawn new coin
    const id = Date.now();
    const x = Math.random() * 80 + 10; // random left %
    setCoins((prev) => [...prev, { id, x }]);

    // remove after animation (2.5s)
    setTimeout(() => {
      setCoins((prev) => prev.filter((coin) => coin.id !== id));
    }, 2500);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <Typography variant="h3" color="primary" gutterBottom>
        Airona Clicker ✨
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Click Airona to earn <strong>Luno</strong>!
      </Typography>

      <Box my={4}>
        <Image
          src="/airona/airona_logo.png"
          alt="Airona Clicker"
          width={250}
          height={250}
          style={{
            cursor: "pointer",
            transition: "transform 0.1s ease",
          }}
          onClick={handleClick}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        />
      </Box>

      {/* Score */}
      <Card sx={{ maxWidth: 300, mx: "auto" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Image src="/airona/luno.png" alt="Luno" width={40} height={40} />
            <Typography variant="h5" ml={2} color="secondary">
              {luno} Luno
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Raining coins */}
      {coins.map((coin) => (
        <Box
          key={coin.id}
          sx={{
            position: "absolute",
            top: 0,
            left: `${coin.x}%`,
            animation: "fall 2.5s linear forwards",
          }}
        >
          <Image src="/airona/luno.png" alt="Falling Luno" width={30} height={30} />
        </Box>
      ))}

      {/* Falling animation */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Container>
  );
}

"use client";

import { useState, useRef } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import dynamic from "next/dynamic";

const TransformWrapper = dynamic(
  () => import("react-zoom-pan-pinch").then((mod) => mod.TransformWrapper),
  { ssr: false }
);
const TransformComponent = dynamic(
  () => import("react-zoom-pan-pinch").then((mod) => mod.TransformComponent),
  { ssr: false }
);

const MAP_WIDTH = 4000;
const MAP_HEIGHT = 3000;

export default function GamePage() {
  const [guess, setGuess] = useState(null);
  const [result, setResult] = useState(null);

  const answer = { x: 2500, y: 1800 };

  const transformRef = useRef(null);

  const handleMapClick = (e) => {
    if (!transformRef.current) return;

    const { state } = transformRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const scaleX = MAP_WIDTH / containerWidth;
    const scaleY = MAP_HEIGHT / containerHeight;

    const x = clickX * scaleX;
    const y = clickY * scaleY;

    setGuess({ x, y });
    setResult(null);
  };

  const handleSubmit = () => {
    if (!guess) return;

    const dx = guess.x - answer.x;
    const dy = guess.y - answer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) setResult("Winner! 🏆");
    else if (distance < 150) setResult("Near! 👍");
    else setResult("Far! 😅");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Map Guessing Game
      </Typography>
      <Typography variant="body1" align="center" gutterBottom>
        Click anywhere on the map to place your guess!
      </Typography>

      <Box sx={{ width: "100%", height: "80vh", border: "2px solid #ccc", mx: "auto", mb: 2 }}>
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit={true}
          limitToBounds={true}
          wheel={{ step: 0.1 }}
        >
          {({ state }) => (
            <>
              {/* Toolbar */}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1, gap: 1, flexWrap: "wrap" }}>
                <Button onClick={() => transformRef.current?.zoomIn()} variant="outlined" size="small">Zoom In</Button>
                <Button onClick={() => transformRef.current?.zoomOut()} variant="outlined" size="small">Zoom Out</Button>
                <Button onClick={() => transformRef.current?.resetTransform()} variant="outlined" size="small">Reset</Button>
                <Button onClick={handleSubmit} variant="contained" size="small" disabled={!guess}>Submit Guess</Button>
                {result && <Typography variant="body1" sx={{ ml: 2 }}>{result}</Typography>}
              </Box>

              <TransformComponent>
                <Box
                  sx={{ width: "100%", height: "100%", position: "relative" }}
                  onClick={handleMapClick}
                >
                  <img
                    src="/map/asterplain.jpg"
                    alt="Map"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    loading="eager"
                  />

                  {guess && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${(guess.x / MAP_WIDTH) * 100}%`,
                        top: `${(guess.y / MAP_HEIGHT) * 100}%`,
                        width: 20 / (state?.scale || 1),
                        height: 20 / (state?.scale || 1),
                        bgcolor: "red",
                        borderRadius: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </Box>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </Box>
    </Container>
  );
}

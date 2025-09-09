"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Box, Container, Typography, Button, Stack } from "@mui/material";

const stickers = [
  "airona1.png",
  "airona2.png",
  "airona3.png",
  "airona4.png",
  "airona5.png",
  "airona6.png",
  "airona7.png",
  "airona8.png",
  "airona9.png",
  "airona10.png",
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function AironaMemory() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const [previewing, setPreviewing] = useState(false);
  const [previewCountdown, setPreviewCountdown] = useState(0);

  const [scatterCountdown, setScatterCountdown] = useState(5);
  const [positions, setPositions] = useState([]);

  const difficulties = {
    easy: { time: 120, moves: 40 },
    hard: { time: 60, moves: 25 },
    nightmare: { time: 60, moves: 25 },
  };

  const startGame = (mode) => {
    const shuffled = shuffle([...stickers, ...stickers]);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setDifficulty(mode);
    setGameOver(false);
    setStarted(true);

    // Initialize positions
    setPositions(shuffled.map(() => ({ x: 0, y: 0 })));

    // show preview
    setPreviewing(true);
    setPreviewCountdown(5);
    setTimeLeft(difficulties[mode].time);

    // Reset scatter countdown only for nightmare
    if (mode === "nightmare") setScatterCountdown(5);
  };

  // Countdown for preview
  useEffect(() => {
    if (!previewing || previewCountdown <= 0) return;
    const t = setTimeout(() => setPreviewCountdown((c) => c - 1), 1000);
    if (previewCountdown === 1) setPreviewing(false);
    return () => clearTimeout(t);
  }, [previewCountdown, previewing]);

  // Timer after preview ends
  useEffect(() => {
    if (!started || gameOver || previewing) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, gameOver, previewing]);

  // Scatter countdown for nightmare difficulty only
  useEffect(() => {
    if (difficulty !== "nightmare" || !started || gameOver || previewing || matched.length === cards.length)
      return;

    const interval = setInterval(() => {
      setScatterCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [difficulty, started, gameOver, previewing, matched, cards]);

  // Trigger scatter
  useEffect(() => {
    if (difficulty !== "nightmare") return;
    if (scatterCountdown <= 0) {
      scatterCards();
      setScatterCountdown(5);
    }
  }, [scatterCountdown, difficulty]);

  const scatterCards = () => {
    setCards((prev) => {
      const unmatchedIndexes = prev.map((c, i) => (matched.includes(i) ? null : i)).filter((i) => i !== null);
      const shuffledIndexes = shuffle(unmatchedIndexes);

      // Animate tiles
      setPositions((oldPositions) =>
        oldPositions.map((pos, i) => {
          if (matched.includes(i)) return pos;
          const newIndex = shuffledIndexes.indexOf(i);
          return {
            x: (newIndex - i) * 100,
            y: Math.random() * 20 - 10,
          };
        })
      );

      // Update cards array order to match new positions
      const newCards = [...prev];
      for (let i = 0; i < unmatchedIndexes.length; i++) {
        const from = unmatchedIndexes[i];
        const to = shuffledIndexes[i];
        [newCards[from], newCards[to]] = [newCards[to], newCards[from]];
      }

      // Reset positions after animation
      setTimeout(() => {
        setPositions((prev) => prev.map(() => ({ x: 0, y: 0 })));
      }, 600);

      return newCards;
    });
  };

  const handleFlip = (index) => {
    if (gameOver || previewing) return;
    if (flipped.includes(index) || flipped.length === 2) return;

    setFlipped((f) => [...f, index]);

    if (flipped.length === 1) {
      setMoves((m) => m + 1);
      const first = flipped[0];
      const second = index;

      if (cards[first] === cards[second]) {
        setMatched((prev) => [...prev, first, second]);
        if (difficulty === "nightmare") setScatterCountdown(5);
      }

      setTimeout(() => {
        setFlipped([]);
      }, 800);
    }
  };

  // Win/Lose check
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setGameOver(true);
    }
    if (
      difficulty &&
      moves >= difficulties[difficulty].moves &&
      matched.length !== cards.length &&
      started
    ) {
      setGameOver(true);
    }
  }, [matched, moves, cards, difficulty, started]);

  return (
    <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
      <Typography variant="h3" color="primary" gutterBottom>
        Airona Memory Game
      </Typography>

      {!started ? (
        <Stack spacing={2} alignItems="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            Choose Difficulty:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="success" onClick={() => startGame("easy")}>
              Easy
            </Button>
            <Button variant="contained" color="error" onClick={() => startGame("hard")}>
              Hard
            </Button>
            <Button variant="contained" color="secondary" onClick={() => startGame("nightmare")}>
              Nightmare
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          {/* Stats */}
          {!previewing && (
            <Typography variant="h6" mb={2}>
              Time Left:{" "}
              <strong style={{ color: timeLeft < 10 ? "red" : "inherit" }}>
                {timeLeft}s
              </strong>{" "}
              | Moves: {moves}/{difficulties[difficulty].moves}{" "}
              {difficulty === "nightmare" && <>| Scatter in: {scatterCountdown}s</>}
            </Typography>
          )}

          {/* Grid */}
          <Box
            sx={{
              maxWidth: 950,
              mx: "auto",
              backgroundColor: "#fafafa",
              p: 2,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "repeat(4, 1fr)",
                  sm: "repeat(5, 1fr)",
                  md: "repeat(5, 1fr)",
                },
              }}
            >
              {cards.map((card, i) => {
                const isFlipped = previewing || flipped.includes(i) || matched.includes(i);
                const isMatched = matched.includes(i);
                return (
                  <Box key={i}>
                    <Box
                      component="button"
                      onClick={() => handleFlip(i)}
                      disabled={gameOver || isMatched || previewing}
                      sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        border: "none",
                        background: "transparent",
                        cursor: gameOver || isMatched || previewing ? "default" : "pointer",
                        perspective: "1000px",
                        position: "relative",
                        transition: "transform 600ms ease",
                        transform: `translate(${positions[i]?.x}px, ${positions[i]?.y}px)`,
                        "& .matchedFront": {
                          animation: isMatched ? "pulse 0.5s ease" : "none",
                        },
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.2)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transition: "transform 600ms",
                          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                      >
                        {/* Back */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            backfaceVisibility: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1,
                            background: "linear-gradient(135deg, #0b1a12, #154c1a)",
                            backgroundImage:
                              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 10px, transparent 10px 20px)",
                            boxShadow: "inset 0 0 14px rgba(0,0,0,0.75)",
                          }}
                        >
                          <Box sx={{ position: "relative", width: "60%", height: "60%" }}>
                            <Image
                              src="/airona/airona_logo.png"
                              alt="card back"
                              fill
                              style={{
                                objectFit: "contain",
                                filter: "drop-shadow(0 0 5px rgba(0,0,0,0.6))",
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Front */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1,
                            backgroundColor: "#ffffff",
                          }}
                          className="matchedFront"
                        >
                          <Box sx={{ position: "relative", width: "70%", height: "70%" }}>
                            <Image
                              src={`/airona/${card}`}
                              alt="sticker"
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Preview countdown overlay */}
          {previewing && (
            <Box mt={3}>
              <Typography variant="h4" color="secondary">
                Memorize the cards! Starting in {previewCountdown}...
              </Typography>
            </Box>
          )}

          {/* Game over / win */}
          {gameOver && (
            <Box mt={4}>
              {matched.length === cards.length ? (
                <Typography variant="h4" color="success.main">
                  🎉 You Win! 🎉
                </Typography>
              ) : (
                <Typography variant="h4" color="error.main">
                  ❌ Game Over ❌
                </Typography>
              )}
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setStarted(false)}>
                Play Again
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
} from "@mui/material";

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
  const theme = useTheme();

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

    setPositions(shuffled.map(() => ({ x: 0, y: 0 })));

    setPreviewing(true);
    setPreviewCountdown(5);
    setTimeLeft(difficulties[mode].time);

    if (mode === "nightmare") setScatterCountdown(5);
  };

  // Preview countdown
  useEffect(() => {
    if (!previewing || previewCountdown <= 0) return;
    const t = setTimeout(() => setPreviewCountdown((c) => c - 1), 1000);
    if (previewCountdown === 1) setPreviewing(false);
    return () => clearTimeout(t);
  }, [previewCountdown, previewing]);

  // Timer
  useEffect(() => {
    if (!started || gameOver || previewing) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, gameOver, previewing]);

  // Scatter for nightmare
  useEffect(() => {
    if (difficulty !== "nightmare" || !started || gameOver || previewing || matched.length === cards.length)
      return;

    const interval = setInterval(() => {
      setScatterCountdown((c) => c - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [difficulty, started, gameOver, previewing, matched, cards]);

  useEffect(() => {
    if (difficulty !== "nightmare") return;
    if (scatterCountdown <= 0) {
      scatterCards();
      setScatterCountdown(5);
    }
  }, [scatterCountdown, difficulty]);

  const scatterCards = () => {
    setCards((prev) => {
      const unmatchedIndexes = prev
        .map((c, i) => (matched.includes(i) ? null : i))
        .filter((i) => i !== null);
      const shuffledIndexes = shuffle(unmatchedIndexes);

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

      const newCards = [...prev];
      for (let i = 0; i < unmatchedIndexes.length; i++) {
        const from = unmatchedIndexes[i];
        const to = shuffledIndexes[i];
        [newCards[from], newCards[to]] = [newCards[to], newCards[from]];
      }

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

  // Frosted glass style
  const frostedGlass = (dark, light) => ({
    borderRadius: 1,
    background: theme.palette.mode === "dark" ? dark : light,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-150%",
      width: "50%",
      height: "100%",
      background:
        "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
      transform: "skewX(-25deg)",
    },
    "&:hover::before, &.shimmer::before": {
      animation: "shimmer 1.5s ease-in-out",
    },
    "@keyframes shimmer": {
      "0%": { left: "-150%" },
      "100%": { left: "150%" },
    },
  });

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

          <Box
            sx={{
              maxWidth: 950,
              mx: "auto",
              p: 2,
              borderRadius: 2,
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
                            {/* Back (Logo) */}
                            <Box
                            sx={{
                                borderRadius: 1,
                                background: theme.palette.mode === "dark"
                                ? "rgba(120, 90, 180, 0.25)"   // 🌙 purple glass for back in dark mode
                                : "rgba(200, 180, 250, 0.6)", // 🌞 lighter purple glass in light mode
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                                inset: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backfaceVisibility: "hidden",
                            }}
                            >
                            <Box sx={{ width: "60%", height: "60%", position: "relative" }}>
                                <Image
                                src="/airona/airona_logo.png"
                                alt="card back"
                                fill
                                style={{ objectFit: "contain" }}
                                />
                            </Box>
                            </Box>

                            {/* Front (Sticker) */}
                            <Box
                            sx={{
                                borderRadius: 1,
                                background: theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.08)"    // 🌙 smoky neutral glass for front
                                : "rgba(255,255,255,0.6)",   // 🌞 frosty white glass in light mode
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                                inset: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                            >
                            <Box sx={{ width: "70%", height: "70%", position: "relative" }}>
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

          {previewing && (
            <Box mt={3}>
              <Typography variant="h4" color="secondary">
                Memorize the cards! Starting in {previewCountdown}...
              </Typography>
            </Box>
          )}

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

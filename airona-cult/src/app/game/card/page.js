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
  }, [matched, moves, cards, difficulty, started, difficulties]);

  

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
                    gap: { xs: 0.1, sm: 1, md: 1.5 }, // 📱 tighter spacing on mobile
                    gridTemplateColumns: {
                    xs: "repeat(4, 1fr)",
                    sm: "repeat(5, 1fr)",
                    md: "repeat(5, 1fr)",
                    },
                    p: 2,
                    border: "3px solid rgba(255, 255, 255, 0.2)", // 🌟 outer border
                    borderRadius: 1,
                   background: theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, rgba(90,60,140,0.35), rgba(30,30,50,0.35))"
                    : "linear-gradient(145deg, rgba(200,180,250,0.5), rgba(240,230,255,0.5))",
                    backdropFilter: "blur(10px)",
                    boxShadow: theme.palette.mode === "dark"
                    ? "0 4px 20px rgba(0,0,0,0.7)"
                    : "0 4px 20px rgba(0,0,0,0.15)",
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
                                : "rgba(200, 180, 250, 0.45)", // 🌞 light purple glass in light mode
                                backdropFilter: "blur(12px) saturate(160%)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                boxShadow:
                                theme.palette.mode === "dark"
                                    ? "inset 0 1px 4px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.6)"
                                    : "inset 0 1px 4px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.15)",
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backfaceVisibility: "hidden",
                                overflow: "hidden",

                                "&::after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background:
                                    "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
                                opacity: 0.4,
                                pointerEvents: "none",
                                },
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
                                ? "rgba(40,40,50,0.35)" // 🌙 smoky glass for front
                                : "rgba(255,255,255,0.55)", // 🌞 frosty white glass
                                backdropFilter: "blur(12px) saturate(160%)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                boxShadow:
                                theme.palette.mode === "dark"
                                    ? "inset 0 1px 4px rgba(255,255,255,0.08), 0 4px 10px rgba(0,0,0,0.5)"
                                    : "inset 0 1px 4px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.15)",
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                                overflow: "hidden",

                                "&::after": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background:
                                    "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 70%)",
                                opacity: 0.3,
                                pointerEvents: "none",
                                },
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

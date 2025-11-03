"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { styled } from "@mui/material/styles";

const HalloweenCard = styled(Card)(({ theme }) => ({
  position: "relative",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 8px 20px rgba(255, 107, 0, 0.4)",
  },
}));

const HalloweenBackground = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%)",
  minHeight: "100vh",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export default function HalloweenVotePage() {
  const [username, setUsername] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentBracket, setCurrentBracket] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [roundWinners, setRoundWinners] = useState([]);
  const [roundLosers, setRoundLosers] = useState([]);
  const [savedWinners, setSavedWinners] = useState([]); // Store winners during losers bracket
  const [roundName, setRoundName] = useState("Round of 16");
  const [expandedImage, setExpandedImage] = useState(null);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [finalRankings, setFinalRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDoubleElim, setIsDoubleElim] = useState(false);
  const [roundRobinMatches, setRoundRobinMatches] = useState([]);
  const [roundRobinResults, setRoundRobinResults] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    fetchSubmissions();
    checkIfVoted();
  }, []);

  useEffect(() => {
    if (currentMatch) {
      setImagesLoaded(false);
      setCountdown(3);
      
      // Preload images
      const img1 = new Image();
      const img2 = new Image();
      let loaded = 0;
      
      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) {
          setImagesLoaded(true);
        }
      };
      
      img1.onload = checkLoaded;
      img2.onload = checkLoaded;
      img1.src = currentMatch[0].image_url;
      img2.src = currentMatch[1].image_url;
    }
  }, [currentMatch]);

  useEffect(() => {
    if (imagesLoaded && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [imagesLoaded, countdown]);

  const checkIfVoted = () => {
    const votedUsers = JSON.parse(localStorage.getItem('halloween_voted_users') || '[]');
    if (votedUsers.length > 0) {
      setHasVoted(true);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/halloween/upload");
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const startTournament = () => {
    if (!username.trim()) {
      alert("Please enter your Discord username!");
      return;
    }

    // Check if user already voted
    const votedUsers = JSON.parse(localStorage.getItem('halloween_voted_users') || '[]');
    if (votedUsers.includes(username.trim().toLowerCase())) {
      alert("You have already completed the tournament! Each user can only vote once.");
      return;
    }

    if (submissions.length !== 16) {
      alert(`Need exactly 16 submissions. Currently have ${submissions.length}`);
      return;
    }

    // Shuffle submissions randomly
    const shuffled = [...submissions].sort(() => Math.random() - 0.5);
    setCurrentBracket(shuffled);
    setCurrentMatch([shuffled[0], shuffled[1]]);
    setMatchIndex(0);
    setRoundWinners([]);
    setRoundLosers([]);
    setSavedWinners([]);
    setRoundName("Round of 16");
    setIsDoubleElim(false);
    setHasStarted(true);
  };

  const handleVote = (winner) => {
    const loser = currentMatch[0].id === winner.id ? currentMatch[1] : currentMatch[0];
    
    const updatedWinners = [...roundWinners, winner];
    const updatedLosers = [...roundLosers, loser];
    
    setRoundWinners(updatedWinners);
    setRoundLosers(updatedLosers);

    // Check if round is complete
    if (matchIndex + 2 >= currentBracket.length) {
      if (isDoubleElim) {
        advanceDoubleElim(updatedWinners, updatedLosers);
      } else {
        advanceRound(updatedWinners, updatedLosers);
      }
    } else {
      // Show next match in current round
      setMatchIndex(matchIndex + 2);
      setCurrentMatch([currentBracket[matchIndex + 2], currentBracket[matchIndex + 3]]);
    }
  };

  const handleRoundRobinVote = (winner) => {
    const loser = currentMatch[0].id === winner.id ? currentMatch[1] : currentMatch[0];
    
    const matchKey = `${currentMatch[0].id}-${currentMatch[1].id}`;
    const updatedResults = {
      ...roundRobinResults,
      [matchKey]: winner.id
    };
    setRoundRobinResults(updatedResults);

    // Check if all round robin matches complete
    if (Object.keys(updatedResults).length >= roundRobinMatches.length) {
      calculateRoundRobinWinner(updatedResults);
    } else {
      // Show next round robin match
      const nextMatchIndex = Object.keys(updatedResults).length;
      setCurrentMatch(roundRobinMatches[nextMatchIndex]);
    }
  };

  const advanceRound = (winners, losers) => {
    // Top 4 - start double elimination
    if (winners.length === 4) {
      setRoundName("Top 4 - Double Elimination");
      setCurrentBracket(winners);
      setCurrentMatch([winners[0], winners[1]]);
      setMatchIndex(0);
      setRoundWinners([]);
      setRoundLosers([]);
      setIsDoubleElim(true);
      return;
    }

    if (winners.length === 1) {
      // Tournament complete!
      setTournamentComplete(true);
      calculateFinalRankings(winners[0]);
      return;
    }

    // Determine next round
    let nextRound = "";
    if (winners.length === 8) nextRound = "Round of 8";
    else if (winners.length === 2) nextRound = "Finals";

    setRoundName(nextRound);
    setCurrentBracket(winners);
    setCurrentMatch([winners[0], winners[1]]);
    setMatchIndex(0);
    setRoundWinners([]);
    setRoundLosers([]);
  };

  const advanceDoubleElim = (winners, losers) => {
    // After first round of top 4, we have 2 winners and 2 losers
    // Losers face each other, then winner of that faces loser of winners bracket
    if (winners.length === 2 && losers.length === 2 && savedWinners.length === 0) {
      // Start losers bracket - save the winners for later
      setRoundName("Top 4 - Losers Bracket");
      setCurrentBracket(losers);
      setCurrentMatch([losers[0], losers[1]]);
      setMatchIndex(0);
      setSavedWinners(winners); // Save original winners
      setRoundWinners([]); // Clear for losers bracket
      setRoundLosers([]);
      setIsDoubleElim(true);
      return;
    }

    // After losers bracket (single match), we have 1 winner from losers bracket
    if (winners.length === 1 && savedWinners.length === 2) {
      // The 2 original winners + 1 loser bracket winner = top 3
      const top3 = [...savedWinners, winners[0]];
      startRoundRobin(top3);
      return;
    }
  };

  const startRoundRobin = (top3) => {
    // Create all possible matchups for round robin (3 matches total)
    const matches = [
      [top3[0], top3[1]],
      [top3[0], top3[2]],
      [top3[1], top3[2]]
    ];
    
    setRoundRobinMatches(matches);
    setRoundRobinResults({});
    setRoundName("Top 3 - Round Robin");
    setCurrentMatch(matches[0]);
    setIsDoubleElim(false);
  };

  const calculateRoundRobinWinner = (results) => {
    const top3 = roundRobinMatches.flat().filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    // Count wins for each submission
    const winCounts = {};
    top3.forEach(sub => {
      winCounts[sub.id] = 0;
    });

    Object.entries(results).forEach(([matchKey, winnerId]) => {
      winCounts[winnerId]++;
    });

    // Sort by wins
    const sorted = top3.sort((a, b) => winCounts[b.id] - winCounts[a.id]);
    
    setTournamentComplete(true);
    calculateFinalRankings(sorted[0], sorted);
  };

  const calculateFinalRankings = async (winner, top3Rankings = null) => {
    // Store winner in database
    setLoading(true);
    try {
      const res = await fetch("/api/halloween/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: winner.id,
          voterUsername: username,
          top3: top3Rankings ? top3Rankings.map(sub => sub.id) : null
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Save username to localStorage to prevent re-voting
        const votedUsers = JSON.parse(localStorage.getItem('halloween_voted_users') || '[]');
        if (!votedUsers.includes(username.trim().toLowerCase())) {
          votedUsers.push(username.trim().toLowerCase());
          localStorage.setItem('halloween_voted_users', JSON.stringify(votedUsers));
        }
        
        setFinalRankings(top3Rankings || [winner]);
      } else {
        console.error("Failed to save results:", data);
        alert(`Error saving results: ${data.error || 'Unknown error'}. Please contact an admin.`);
        setFinalRankings(top3Rankings || [winner]);
      }
    } catch (error) {
      console.error("Error saving winner:", error);
      alert(`Error saving results: ${error.message}. Please contact an admin.`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  if (hasVoted) {
    return (
      <HalloweenBackground>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <EmojiEventsIcon sx={{ fontSize: 80, color: "#ff6b00", mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold" color="#ff6b00">
                You&apos;ve Already Voted!
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
                Thank you for participating in the Halloween Tournament!
                Each person can only vote once.
              </Typography>
              <Button
                variant="contained"
                sx={{ backgroundColor: "#ff6b00" }}
                onClick={() => window.location.href = "/halloween/results"}
              >
                View Results
              </Button>
            </CardContent>
          </Card>
        </Container>
      </HalloweenBackground>
    );
  }

  if (!hasStarted) {
    return (
      <HalloweenBackground>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)",
              color: "white",
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <EmojiEventsIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h3" gutterBottom fontWeight="bold">
                🎃 Halloween Tournament 🎃
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Vote your way to the winner!
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                You&apos;ll vote through a complete tournament bracket:
                <br />16 → 8 → 4 → 2 → Winner!
              </Typography>
              
              <TextField
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  mb: 3,
                  backgroundColor: "white",
                  borderRadius: 1,
                  "& .MuiInputBase-input": {
                    padding: "16px 14px",
                  },
                }}
                placeholder="Enter your Discord Username"
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={startTournament}
                disabled={!username.trim() || submissions.length !== 16}
                sx={{
                  backgroundColor: "white",
                  color: "#ff6b00",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  py: 2,
                  "&:hover": {
                    backgroundColor: "#fff5ee",
                  },
                }}
              >
                Start Tournament!
              </Button>
            </CardContent>
          </Card>
        </Container>
      </HalloweenBackground>
    );
  }

  if (tournamentComplete) {
    return (
      <HalloweenBackground>
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <EmojiEventsIcon sx={{ fontSize: 100, color: "#FFD700", mb: 2 }} />
              <Typography variant="h3" gutterBottom fontWeight="bold" color="#ff6b00">
                🏆 Tournament Complete! 🏆
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                Winner: {finalRankings[0]?.author_name}
              </Typography>
              {finalRankings[0] && (
                <Box
                  component="img"
                  src={finalRankings[0].image_url}
                  alt={finalRankings[0].author_name}
                  sx={{ width: "100%", maxWidth: 400, mt: 3, borderRadius: 2 }}
                />
              )}
              {finalRankings.length === 3 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Final Top 3:</Typography>
                  {finalRankings.map((sub, index) => (
                    <Typography key={sub.id} variant="body1">
                      {index + 1}. {sub.author_name}
                    </Typography>
                  ))}
                </Box>
              )}
              <Typography variant="body1" sx={{ mt: 3 }}>
                Thank you for voting, {username}!
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </HalloweenBackground>
    );
  }

  if (!currentMatch) {
    return (
      <HalloweenBackground>
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" color="white">
            Loading...
          </Typography>
        </Container>
      </HalloweenBackground>
    );
  }

  const matchNumber = Math.floor(matchIndex / 2) + 1;
  const totalMatches = currentBracket.length / 2;

  return (
    <HalloweenBackground>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" color="white" fontWeight="bold" gutterBottom>
            🎃 Halloween Tournament 🎃
          </Typography>
          <Chip
            label={`${username}`}
            sx={{
              backgroundColor: "#ff6b00",
              color: "white",
              fontWeight: "bold",
              mb: 2,
            }}
          />
          <Typography variant="h5" color="white" gutterBottom>
            {roundName}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            {roundRobinMatches.length > 0 
              ? `Match ${Object.keys(roundRobinResults).length + 1} of ${roundRobinMatches.length}`
              : `Match ${matchNumber} of ${totalMatches}`
            }
          </Typography>
        </Box>

        {/* Current Match */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4 }}>
          {/* Submission 1 */}
          <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "450px" } }}>
            <HalloweenCard onClick={() => handleVote(currentMatch[0])}>
              <Box
                component="img"
                src={currentMatch[0].image_url}
                alt={currentMatch[0].author_name}
                onClick={(e) => { e.stopPropagation(); handleImageClick(currentMatch[0].image_url); }}
                sx={{ 
                  width: "100%", 
                  height: { xs: "500px", sm: "600px", md: "700px" },
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  cursor: "zoom-in" 
                }}
              />
              <CardContent>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={!imagesLoaded || countdown > 0}
                  sx={{ 
                    mt: 2, 
                    backgroundColor: "#ff6b00", 
                    fontSize: "1.1rem", 
                    py: 1.5,
                    "&:disabled": {
                      backgroundColor: "#ccc",
                      color: "#666",
                    }
                  }}
                  onClick={() => roundRobinMatches.length > 0 ? handleRoundRobinVote(currentMatch[0]) : handleVote(currentMatch[0])}
                >
                  {!imagesLoaded ? "Loading images..." : countdown > 0 ? `Wait ${countdown}s` : "Vote for this"}
                </Button>
              </CardContent>
            </HalloweenCard>
          </Box>

          {/* VS Divider */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: { xs: 40, md: 80 }, my: { xs: 2, md: 0 } }}>
            <Typography variant="h3" fontWeight="bold" color="#ff6b00">
              VS
            </Typography>
          </Box>

          {/* Submission 2 */}
          <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "450px" } }}>
            <HalloweenCard onClick={() => handleVote(currentMatch[1])}>
              <Box
                component="img"
                src={currentMatch[1].image_url}
                alt={currentMatch[1].author_name}
                onClick={(e) => { e.stopPropagation(); handleImageClick(currentMatch[1].image_url); }}
                sx={{ 
                  width: "100%", 
                  height: { xs: "500px", sm: "600px", md: "700px" },
                  objectFit: "contain",
                  backgroundColor: "#f5f5f5",
                  cursor: "zoom-in" 
                }}
              />
              <CardContent>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  disabled={!imagesLoaded || countdown > 0}
                  sx={{ 
                    mt: 2, 
                    backgroundColor: "#ff6b00", 
                    fontSize: "1.1rem", 
                    py: 1.5,
                    "&:disabled": {
                      backgroundColor: "#ccc",
                      color: "#666",
                    }
                  }}
                  onClick={() => roundRobinMatches.length > 0 ? handleRoundRobinVote(currentMatch[1]) : handleVote(currentMatch[1])}
                >
                  {!imagesLoaded ? "Loading images..." : countdown > 0 ? `Wait ${countdown}s` : "Vote for this"}
                </Button>
              </CardContent>
            </HalloweenCard>
          </Box>
        </Box>

        {/* Image Zoom Dialog */}
        <Dialog open={!!expandedImage} onClose={() => setExpandedImage(null)} maxWidth="lg">
          <Box
            component="img"
            src={expandedImage}
            alt="Expanded view"
            sx={{ width: "100%", maxHeight: "90vh", objectFit: "contain" }}
          />
        </Dialog>
      </Container>
    </HalloweenBackground>
  );
}

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
  Grid,
  LinearProgress,
  Chip,
} from "@mui/material";
import HowlIcon from "@mui/icons-material/Celebration";
import { styled } from "@mui/material/styles";

const HalloweenCard = styled(Card)(({ theme, selected }) => ({
  position: "relative",
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: selected ? "4px solid #ff6b00" : "2px solid transparent",
  "&:hover": {
    transform: "scale(1.05)",
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
  const [submissions, setSubmissions] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const [remainingMatches, setRemainingMatches] = useState([]);
  const [userVoteHistory, setUserVoteHistory] = useState(new Map()); // Track user's votes: winner -> loser
  const [totalMatchesGenerated, setTotalMatchesGenerated] = useState(0); // Track initial total matches
  const [expandedImage, setExpandedImage] = useState(null); // For image zoom dialog
  const [confirmDialog, setConfirmDialog] = useState({ open: false, choice: null, submissionIndex: null }); // Confirmation dialog

  useEffect(() => {
    fetchSubmissions();
  }, []);

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

  // Smart matchup generation with transitive inference and conflict detection
  // Implements: If A>B and B>C then skip A>C (transitive)
  //             If A>B but C>B then compare A vs C (conflict resolution)
  const generateSmartMatches = (subs, completedVotes) => {
    const voteMap = new Map(); // winnerId -> Set of loserIds
    
    // Build the vote history from completed votes
    completedVotes.forEach(vote => {
      const match = vote.match_id.match(/round\d+_(\d+)_vs_(\d+)/);
      if (match) {
        const [_, id1, __, id2] = match;
        const winnerId = parseInt(vote.submission_id);
        const loserId = parseInt(vote.opponent_submission_id);
        
        if (!voteMap.has(winnerId)) {
          voteMap.set(winnerId, new Set());
        }
        voteMap.get(winnerId).add(loserId);
      }
    });

    setUserVoteHistory(voteMap);

    // Check if we have a direct comparison
    const hasDirectComparison = (id1, id2) => {
      return (voteMap.has(id1) && voteMap.get(id1).has(id2)) ||
             (voteMap.has(id2) && voteMap.get(id2).has(id1));
    };

    // Check if relationship can be inferred transitively: A>B and B>C means A>C
    const canInferRelationship = (id1, id2) => {
      if (hasDirectComparison(id1, id2)) return true;
      
      // Check if id1 > id2 can be inferred (id1 beats something that beats id2)
      if (voteMap.has(id1)) {
        for (const beaten of voteMap.get(id1)) {
          if (voteMap.has(beaten) && voteMap.get(beaten).has(id2)) {
            return true; // id1 > beaten > id2
          }
        }
      }
      
      // Check if id2 > id1 can be inferred (id2 beats something that beats id1)
      if (voteMap.has(id2)) {
        for (const beaten of voteMap.get(id2)) {
          if (voteMap.has(beaten) && voteMap.get(beaten).has(id1)) {
            return true; // id2 > beaten > id1
          }
        }
      }
      
      return false;
    };

    // Find conflicts: A>B but C>B (both beat B, need to resolve A vs C)
    const findConflicts = () => {
      const conflicts = new Map();
      const subIds = subs.map(s => s.id);
      
      for (let b of subIds) {
        // Find all submissions that beat B
        const beaters = [];
        for (let a of subIds) {
          if (a !== b && voteMap.has(a) && voteMap.get(a).has(b)) {
            beaters.push(a);
          }
        }
        
        // If multiple submissions beat B, they need to be compared
        for (let i = 0; i < beaters.length; i++) {
          for (let j = i + 1; j < beaters.length; j++) {
            const id1 = beaters[i];
            const id2 = beaters[j];
            
            // Only add if no relationship exists or can be inferred
            if (!canInferRelationship(id1, id2)) {
              const key = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
              const sub1 = subs.find(s => s.id === id1);
              const sub2 = subs.find(s => s.id === id2);
              if (sub1 && sub2 && !conflicts.has(key)) {
                conflicts.set(key, [sub1, sub2]);
              }
            }
          }
        }
      }
      
      return Array.from(conflicts.values());
    };

    // Calculate vote counts for each submission
    const voteCounts = new Map();
    subs.forEach(sub => {
      const asWinner = voteMap.has(sub.id) ? voteMap.get(sub.id).size : 0;
      const asLoser = Array.from(voteMap.values()).filter(losers => losers.has(sub.id)).length;
      voteCounts.set(sub.id, asWinner + asLoser);
    });

    const matches = [];
    
    // Priority 1: Resolve conflicts (A>B, C>B -> need A vs C)
    const conflicts = findConflicts();
    matches.push(...conflicts);

    // Priority 2: Ensure each submission has minimum comparisons (at least 3)
    const minComparisons = 3;
    const needMoreVotes = subs.filter(sub => 
      (voteCounts.get(sub.id) || 0) < minComparisons
    ).sort((a, b) => voteCounts.get(a.id) - voteCounts.get(b.id));

    for (let sub of needMoreVotes) {
      if (matches.length >= 30) break; // Max 30 matchups
      
      // Find best opponents that we can't infer relationship with
      const opponents = subs
        .filter(s => s.id !== sub.id && !canInferRelationship(sub.id, s.id))
        .sort((a, b) => voteCounts.get(b.id) - voteCounts.get(a.id));
      
      for (let opp of opponents) {
        if (matches.length >= 30) break;
        if ((voteCounts.get(sub.id) || 0) >= minComparisons) break;
        
        const matchId = `round${currentRound}_${sub.id}_vs_${opp.id}`;
        const reverseMatchId = `round${currentRound}_${opp.id}_vs_${sub.id}`;
        
        if (!completedVotes.some(v => v.match_id === matchId || v.match_id === reverseMatchId)) {
          const alreadyAdded = matches.some(m => 
            (m[0].id === sub.id && m[1].id === opp.id) ||
            (m[1].id === sub.id && m[0].id === opp.id)
          );
          
          if (!alreadyAdded) {
            matches.push([sub, opp]);
            voteCounts.set(sub.id, (voteCounts.get(sub.id) || 0) + 1);
            voteCounts.set(opp.id, (voteCounts.get(opp.id) || 0) + 1);
          }
        }
      }
    }

    // Priority 3: Add strategic matchups between top submissions
    const topSubmissions = [...subs]
      .sort((a, b) => voteCounts.get(b.id) - voteCounts.get(a.id))
      .slice(0, 5); // Top 5 submissions

    for (let i = 0; i < topSubmissions.length && matches.length < 30; i++) {
      for (let j = i + 1; j < topSubmissions.length && matches.length < 30; j++) {
        const id1 = topSubmissions[i].id;
        const id2 = topSubmissions[j].id;
        
        // Only add if relationship cannot be inferred
        if (!canInferRelationship(id1, id2)) {
          const matchId = `round${currentRound}_${id1}_vs_${id2}`;
          if (!completedVotes.some(v => v.match_id === matchId)) {
            const alreadyAdded = matches.some(m => 
              (m[0].id === id1 && m[1].id === id2) ||
              (m[1].id === id1 && m[0].id === id2)
            );
            
            if (!alreadyAdded) {
              matches.push([topSubmissions[i], topSubmissions[j]]);
            }
          }
        }
      }
    }

    return matches;
  };

  const startVoting = async () => {
    if (!username.trim()) {
      alert("Please enter your Discord username!");
      return;
    }

    // Fetch user's voting progress
    let completedVotes = [];
    try {
      const res = await fetch(`/api/halloween/vote?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      
      if (data.votes) {
        completedVotes = data.votes;
        setCompletedMatches(data.completedMatches || []);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }

    setHasStarted(true);
    
    // Generate smart matches
    const smartMatches = generateSmartMatches(submissions, completedVotes);
    
    if (smartMatches.length === 0) {
      setShowCongratsDialog(true);
      return;
    }
    
    setRemainingMatches(smartMatches);
    setTotalMatchesGenerated(smartMatches.length); // Store initial total
    
    // Show first match
    if (smartMatches.length > 0) {
      setCurrentMatch(smartMatches[0]);
      setSelectedSubmission(null);
    }
  };

  const generateNextMatch = () => {
    // Get remaining matches after current one
    const nextMatches = remainingMatches.slice(1);
    
    if (nextMatches.length === 0) {
      // No more matches available for now
      setShowCongratsDialog(true);
      return;
    }
    
    setRemainingMatches(nextMatches);
    setCurrentMatch(nextMatches[0]);
    setSelectedSubmission(null);
  };

  const handleVote = async (winner, loser) => {
    if (!selectedSubmission) {
      setSelectedSubmission(winner.id);
      return;
    }

    setLoading(true);

    const matchId = `round${currentRound}_${winner.id}_vs_${loser.id}`;

    try {
      const res = await fetch("/api/halloween/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterDiscordUsername: username,
          winnerId: winner.id,
          loserId: loser.id,
          roundNumber: currentRound,
          matchId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to record vote!");
        setLoading(false);
        return;
      }

      // Add to completed matches
      setCompletedMatches([...completedMatches, matchId]);
      
      // Move to next match
      setMatchIndex(matchIndex + 1);
      generateNextMatch();
    } catch (error) {
      console.error("Voting error:", error);
      alert("Failed to record vote!");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteChoice = (choice) => {
    const submissionIndex = choice === 'A' ? 0 : 1;
    setSelectedSubmission(currentMatch[submissionIndex].id);
    setConfirmDialog({ open: true, choice, submissionIndex });
  };

  const handleConfirmVote = () => {
    const { submissionIndex } = confirmDialog;
    setConfirmDialog({ open: false, choice: null, submissionIndex: null });
    const winner = currentMatch[submissionIndex];
    const loser = currentMatch[submissionIndex === 0 ? 1 : 0];
    handleVote(winner, loser);
  };

  const handleCancelVote = () => {
    setConfirmDialog({ open: false, choice: null, submissionIndex: null });
    setSelectedSubmission(null);
  };

  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  const totalMatches = totalMatchesGenerated || remainingMatches.length; // Dynamic based on conflicts and needs
  const completedCount = totalMatches - remainingMatches.length;
  const progress = (completedCount / totalMatches) * 100;

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
              <HowlIcon sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h3" gutterBottom fontWeight="bold">
                🎃 Halloween Voting 🎃
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Vote for your favorite Halloween submissions!
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                You&apos;ll be shown two submissions at a time. Choose your favorite in each matchup!
              </Typography>
              
              <TextField
                fullWidth
                label="Enter your Discord Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  mb: 3,
                  backgroundColor: "white",
                  borderRadius: 1,
                }}
                placeholder="YourDiscordName#1234"
              />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={startVoting}
                disabled={!username.trim()}
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
                Start Voting!
              </Button>
            </CardContent>
          </Card>
        </Container>
      </HalloweenBackground>
    );
  }

  if (!currentMatch || currentMatch.length < 2) {
    return (
      <HalloweenBackground>
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" color="white">
            Loading matches...
          </Typography>
        </Container>
      </HalloweenBackground>
    );
  }

  return (
    <HalloweenBackground>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" color="white" fontWeight="bold" gutterBottom>
            🎃 Halloween Voting 🎃
          </Typography>
          <Chip
            label={`Voting as: ${username}`}
            sx={{
              backgroundColor: "#ff6b00",
              color: "white",
              fontWeight: "bold",
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="white" gutterBottom>
              Match {totalMatches - remainingMatches.length + 1} of {totalMatches} matches - Round {currentRound}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              {remainingMatches.length} more matchups (Smart algorithm resolves conflicts dynamically!)
            </Typography>
            <br />
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#ff6b00",
                },
              }}
            />
          </Box>
        </Box>

        {/* Match Title */}
        <Typography
          variant="h5"
          align="center"
          color="white"
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Which one is your favorite? 👻
        </Typography>

        {/* Voting Cards - Compact side by side */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          maxWidth: '1200px',
          mx: 'auto',
          mb: 3,
        }}>
          {currentMatch.map((submission, index) => {
            const label = index === 0 ? 'A' : 'B';
            const isSelected = selectedSubmission === submission.id;
            
            return (
              <Box 
                key={submission.id} 
                sx={{ 
                  flex: 1,
                  minWidth: 0, // Allow flex item to shrink below content size
                }}
              >
                <Card
                  sx={{
                    position: 'relative',
                    border: isSelected ? '4px solid #ff6b00' : '2px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#1a1a1a',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(255, 107, 0, 0.4)',
                    }
                  }}
                >
                  {/* Picture Label */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.3rem',
                      border: '2px solid white',
                    }}
                  >
                    {label}
                  </Box>

                  {/* Image Container with fixed aspect ratio */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%', // 1:1 aspect ratio
                      backgroundColor: '#000',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(submission.image_url)}
                  >
                    <Box
                      component="img"
                      src={submission.image_url}
                      alt={`Picture ${label}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    {/* Click to expand hint */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: '0.7rem',
                        opacity: 0.8,
                      }}
                    >
                      🔍 Expand
                    </Box>
                  </Box>

                  {/* Vote Button */}
                  <CardContent sx={{ p: 1.5 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => handleVoteChoice(label)}
                      disabled={loading}
                      sx={{
                        backgroundColor: isSelected ? '#ff6b00' : '#555',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: isSelected ? '#ff8c00' : '#666',
                        },
                        '&:disabled': {
                          backgroundColor: '#444',
                          color: '#888',
                        }
                      }}
                    >
                      {isSelected ? `✓ ${label} Selected` : `Vote ${label}`}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        {/* Image Expansion Dialog */}
        <Dialog
          open={Boolean(expandedImage)}
          onClose={handleCloseExpandedImage}
          maxWidth="lg"
          fullWidth
        >
          <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
            <Box
              component="img"
              src={expandedImage}
              alt="Expanded view"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#000' }}>
            <Button onClick={handleCloseExpandedImage} sx={{ color: 'white' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onClose={handleCancelVote}>
          <DialogTitle sx={{ textAlign: 'center', backgroundColor: '#ff6b00', color: 'white', fontWeight: 'bold' }}>
            Confirm Your Vote
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Are you sure you want to vote for Picture {confirmDialog.choice}?
            </Typography>
            {confirmDialog.submissionIndex !== null && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box
                  component="img"
                  src={currentMatch[confirmDialog.submissionIndex]?.image_url}
                  alt={`Picture ${confirmDialog.choice}`}
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    borderRadius: 2,
                    border: '3px solid #ff6b00',
                  }}
                />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              This will be recorded as your choice for this matchup.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              onClick={handleCancelVote}
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmVote}
              variant="contained"
              disabled={loading}
              sx={{
                minWidth: 120,
                backgroundColor: '#ff6b00',
                '&:hover': {
                  backgroundColor: '#ff8c00',
                },
              }}
            >
              {loading ? 'Recording...' : 'Confirm Vote'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Congratulations Dialog */}
        <Dialog open={showCongratsDialog} onClose={() => setShowCongratsDialog(false)}>
          <DialogTitle sx={{ textAlign: "center", backgroundColor: "#ff6b00", color: "white" }}>
            🎉 Thank You for Voting! 🎉
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" gutterBottom>
              You&apos;ve completed all needed matchups!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your votes have been recorded using our smart algorithm that detects conflicts 
              and resolves them dynamically (e.g., if A &gt; B but C &gt; B, we ask you to compare A vs C).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You voted on {totalMatches} strategic matchups instead of all 105 possible combinations for 15 submissions!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => window.location.href = "/"}
              variant="contained"
              sx={{ backgroundColor: "#ff6b00" }}
            >
              Back to Home
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </HalloweenBackground>
  );
}

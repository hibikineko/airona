"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { supabase } from "@/lib/supabaseClient";

export default function HalloweenResultsPage() {
  const { data: session, status } = useSession();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalVoters: 0,
    totalSubmissions: 0,
  });

  useEffect(() => {
    const checkMembership = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const discordId = session.user.id;
      const { data, error } = await supabase
        .from("members")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle();

      if (data) {
        setIsMember(true);
        fetchResults();
      } else {
        setLoading(false);
      }
    };
    checkMembership();
  }, [session]);

  const fetchResults = async () => {
    try {
      // Fetch results from API
      const response = await fetch("/api/halloween/results");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setStats(data.stats || {
        totalVotes: 0,
        totalVoters: 0,
        totalSubmissions: 0,
      });
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (index) => {
    if (index === 0) return "#FFD700"; // Gold
    if (index === 1) return "#C0C0C0"; // Silver
    if (index === 2) return "#CD7F32"; // Bronze
    return "#666";
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#ff6b00" }} />
      </Container>
    );
  }

  if (!isMember) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          You must be a guild member to view voting results.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: "#ff6b00", mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" color="#ff6b00" gutterBottom>
          🎃 Halloween Voting Results 🎃
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Rankings based on tournament placements
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Each voter completes a full tournament bracket with their choices!
        </Typography>
      </Box>

      {/* Top 3 Podium */}
      {results.length >= 3 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
            🏆 Top 3 Winners 🏆
          </Typography>
          <Grid container spacing={2} justifyContent="center" alignItems="flex-end">
            {/* 2nd Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "3px solid #C0C0C0",
                minHeight: 380
              }}>
                <Box
                  component="img"
                  src={results[1].image_url}
                  alt={results[1].author_name}
                  sx={{ width: "100%", height: 220, objectFit: "contain", backgroundColor: "#f5f5f5" }}
                />
                <CardContent sx={{ pt: 2 }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🥈</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {results[1].author_name}
                  </Typography>
                  <Chip 
                    label={`${results[1].first_place_count || 0} 🥇 ${results[1].second_place_count || 0} 🥈 ${results[1].third_place_count || 0} 🥉`}
                    sx={{ backgroundColor: "#C0C0C0", color: "white", fontWeight: "bold", mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {results[1].total_tournaments || 0} tournaments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 1st Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "4px solid #FFD700",
                minHeight: 420,
                transform: { md: "scale(1.05)" }
              }}>
                <Box
                  component="img"
                  src={results[0].image_url}
                  alt={results[0].author_name}
                  sx={{ width: "100%", height: 250, objectFit: "contain", backgroundColor: "#f5f5f5" }}
                />
                <CardContent sx={{ pt: 2 }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>🥇</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {results[0].author_name}
                  </Typography>
                  <Chip 
                    label={`${results[0].first_place_count || 0} 🥇 ${results[0].second_place_count || 0} 🥈 ${results[0].third_place_count || 0} 🥉`}
                    sx={{ backgroundColor: "#FFD700", color: "white", fontWeight: "bold", fontSize: "1.1rem", mt: 1 }}
                  />
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {results[0].total_tournaments || 0} tournaments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 3rd Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "3px solid #CD7F32",
                minHeight: 380
              }}>
                <Box
                  component="img"
                  src={results[2].image_url}
                  alt={results[2].author_name}
                  sx={{ width: "100%", height: 220, objectFit: "contain", backgroundColor: "#f5f5f5" }}
                />
                <CardContent sx={{ pt: 2 }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🥉</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {results[2].author_name}
                  </Typography>
                  <Chip 
                    label={`${results[2].first_place_count || 0} 🥇 ${results[2].second_place_count || 0} 🥈 ${results[2].third_place_count || 0} 🥉`}
                    sx={{ backgroundColor: "#CD7F32", color: "white", fontWeight: "bold", mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {results[2].total_tournaments || 0} tournaments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Full Standings Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Complete Standings
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Submission</strong></TableCell>
                  <TableCell><strong>Author</strong></TableCell>
                  <TableCell align="center"><strong>Tournament Placements</strong></TableCell>
                  <TableCell align="center"><strong>Total Tournaments</strong></TableCell>
                  <TableCell align="center"><strong>Win Rate</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow
                    key={result.id}
                    sx={{
                      backgroundColor: index < 3 ? getMedalColor(index) + "15" : "inherit",
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={getMedalEmoji(index)}
                        sx={{
                          backgroundColor: getMedalColor(index),
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={result.image_url}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{result.author_name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                        <Chip 
                          label={`🥇 ${result.first_place_count || 0}`}
                          size="small"
                          sx={{ backgroundColor: "#FFD700", color: "white", fontWeight: "bold" }}
                        />
                        <Chip 
                          label={`🥈 ${result.second_place_count || 0}`}
                          size="small"
                          sx={{ backgroundColor: "#C0C0C0", color: "white", fontWeight: "bold" }}
                        />
                        <Chip 
                          label={`🥉 ${result.third_place_count || 0}`}
                          size="small"
                          sx={{ backgroundColor: "#CD7F32", color: "white", fontWeight: "bold" }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={result.total_tournaments || 0} 
                        color="primary" 
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight="bold" color="primary">
                        {result.win_percentage}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}

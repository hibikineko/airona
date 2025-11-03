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
          Current standings and statistics
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <CardContent sx={{ textAlign: "center", color: "white" }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.totalVotes}
              </Typography>
              <Typography variant="h6">Total Votes Cast</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <CardContent sx={{ textAlign: "center", color: "white" }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.totalVoters}
              </Typography>
              <Typography variant="h6">Unique Voters</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
            <CardContent sx={{ textAlign: "center", color: "white" }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.totalSubmissions}
              </Typography>
              <Typography variant="h6">Total Submissions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top 3 Podium */}
      {results.length >= 3 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "center" }}>
            🏆 Top 3 Winners 🏆
          </Typography>
          <Grid container spacing={2} justifyContent="center" alignItems="flex-end">
            {/* 2nd Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "3px solid #C0C0C0",
                height: 320
              }}>
                <Box
                  component="img"
                  src={results[1].image_url}
                  alt={results[1].author_name}
                  sx={{ width: "100%", height: 200, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h4">🥈</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {results[1].author_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {results[1].wins} wins • {results[1].total_votes} votes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 1st Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "4px solid #FFD700",
                height: 360,
                transform: "scale(1.05)"
              }}>
                <Box
                  component="img"
                  src={results[0].image_url}
                  alt={results[0].author_name}
                  sx={{ width: "100%", height: 220, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h3">🥇</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {results[0].author_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {results[0].wins} wins • {results[0].total_votes} votes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 3rd Place */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                textAlign: "center", 
                border: "3px solid #CD7F32",
                height: 320
              }}>
                <Box
                  component="img"
                  src={results[2].image_url}
                  alt={results[2].author_name}
                  sx={{ width: "100%", height: 200, objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h4">🥉</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {results[2].author_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {results[2].wins} wins • {results[2].total_votes} votes
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
                  <TableCell align="center"><strong>Wins</strong></TableCell>
                  <TableCell align="center"><strong>Losses</strong></TableCell>
                  <TableCell align="center"><strong>Total Votes</strong></TableCell>
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
                      <Chip label={result.wins} color="success" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={result.losses} color="error" size="small" />
                    </TableCell>
                    <TableCell align="center">{result.total_votes}</TableCell>
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

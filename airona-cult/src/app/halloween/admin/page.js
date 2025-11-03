"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import WarningIcon from "@mui/icons-material/Warning";
import { supabase } from "@/lib/supabaseClient";

export default function HalloweenAdminPage() {
  const { data: session, status } = useSession();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState([]);
  const [stats, setStats] = useState({ totalVoters: 0, totalVotes: 0 });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, username: null });
  const [deleting, setDeleting] = useState(false);

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
        fetchVoters();
      } else {
        setLoading(false);
      }
    };
    checkMembership();
  }, [session]);

  const fetchVoters = async () => {
    try {
      const response = await fetch("/api/halloween/admin");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setVoters(data.voters || []);
      setStats({
        totalVoters: data.totalVoters || 0,
        totalVotes: data.totalVotes || 0,
      });
    } catch (error) {
      console.error("Error fetching voters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (username) => {
    setDeleteDialog({ open: true, username });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/halloween/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: deleteDialog.username }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh the voter list
      await fetchVoters();
      setDeleteDialog({ open: false, username: null });
    } catch (error) {
      console.error("Error deleting voter:", error);
      alert("Failed to invalidate voter: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, username: null });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          You must be a guild member to access the admin panel.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <WarningIcon sx={{ fontSize: 60, color: "#ff6b00", mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" color="#ff6b00" gutterBottom>
          🎃 Halloween Voting Admin Panel 🎃
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage voters and voting activity
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <CardContent sx={{ textAlign: "center", color: "white" }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold">
                {stats.totalVoters}
              </Typography>
              <Typography variant="h6">Unique Voters</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
            <CardContent sx={{ textAlign: "center", color: "white" }}>
              <HowToVoteIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" fontWeight="bold">
                {stats.totalVotes}
              </Typography>
              <Typography variant="h6">Total Votes Cast</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Voters Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            All Voters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the delete button to invalidate all votes from a specific user
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell><strong>Discord Username</strong></TableCell>
                  <TableCell align="center"><strong>Vote Count</strong></TableCell>
                  <TableCell align="center"><strong>First Vote</strong></TableCell>
                  <TableCell align="center"><strong>Last Vote</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No voters yet</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  voters.map((voter) => (
                    <TableRow key={voter.username}>
                      <TableCell>
                        <Typography fontWeight="bold">{voter.username}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={voter.voteCount} 
                          color={voter.voteCount > 30 ? "error" : "primary"} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(voter.firstVote)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(voter.lastVote)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Invalidate all votes from this user">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(voter.username)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ color: "#ff6b00", fontWeight: "bold" }}>
          ⚠️ Invalidate Voter
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to invalidate all votes from{" "}
            <strong>{deleteDialog.username}</strong>?
          </DialogContentText>
          <DialogContentText sx={{ mt: 2, color: "error.main" }}>
            This action will delete all their votes and cannot be undone. The voting results will be automatically recalculated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? "Deleting..." : "Delete All Votes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

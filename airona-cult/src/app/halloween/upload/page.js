"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Grid,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HalloweenUploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [form, setForm] = useState({
    authorName: "",
    image: null,
  });

  useEffect(() => {
    const checkMembership = async () => {
      if (!session?.user) return;
      const discordId = session.user.id;

      const { data, error } = await supabase
        .from("members")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle();

      if (data) {
        setIsMember(true);
        fetchSubmissions();
      }
    };
    checkMembership();
  }, [session]);

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMember) {
      alert("You must be a guild member to upload!");
      return;
    }

    if (!form.authorName || !form.image) {
      alert("Please provide both author name and image!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("authorName", form.authorName);
    formData.append("image", form.image);

    try {
      const res = await fetch("/api/halloween/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        alert(data.error || "Failed to upload!");
        return;
      }

      alert("Halloween submission uploaded successfully!");
      setForm({ authorName: "", image: null });
      fetchSubmissions();
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("halloween_submissions")
        .update({ is_active: false })
        .eq("id", deleteDialog.id);

      if (error) throw error;

      alert("Submission deactivated successfully!");
      setDeleteDialog({ open: false, id: null });
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission!");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ color: "#ff6b00" }}>
            🎃 Halloween Submission Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload Halloween event submissions for community voting
          </Typography>

          {!isMember ? (
            <Alert severity="error">
              You must be a cultist to upload Halloween submissions.
            </Alert>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Author Name (Discord Username)"
                name="authorName"
                value={form.authorName}
                onChange={handleChange}
                required
                fullWidth
                helperText="Enter the Discord username of the person who created this submission"
              />

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={loading}
                  fullWidth
                  sx={{
                    borderColor: "#ff6b00",
                    color: "#ff6b00",
                    "&:hover": { borderColor: "#ff8c00", backgroundColor: "rgba(255, 107, 0, 0.1)" },
                  }}
                >
                  Select Halloween Image
                  <input
                    type="file"
                    hidden
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </Button>
                {form.image && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {form.image.name} ({(form.image.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !form.authorName || !form.image}
                startIcon={loading && <CircularProgress size={20} />}
                sx={{
                  backgroundColor: "#ff6b00",
                  "&:hover": { backgroundColor: "#ff8c00" },
                }}
              >
                {loading ? "Uploading..." : "Upload Submission"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Display existing submissions */}
      {isMember && submissions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Current Submissions ({submissions.length})
            </Typography>
            <Grid container spacing={2}>
              {submissions.map((submission) => (
                <Grid item xs={12} sm={6} md={4} key={submission.id}>
                  <Card variant="outlined">
                    <Box
                      component="img"
                      src={submission.image_url}
                      alt={submission.author_name}
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {submission.author_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {new Date(submission.upload_date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteDialog({ open: true, id: submission.id })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to deactivate this submission? It will no longer appear in voting.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

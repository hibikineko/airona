"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation"; 
import { supabase } from "@/lib/supabaseClient";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "fanart", // fanart, posts, screenshot, sesbian
    title: "",
    text: "",
    source: "",
    artist: "",
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

      if (data) setIsMember(true);
    };
    checkMembership();
  }, [session]);

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

    setLoading(true); // start loader

    const formData = new FormData();
    formData.append("title", form.title);

    if (form.image) formData.append("image", form.image);
    if (form.type === "fanart") {
      if (form.source) formData.append("source", form.source);
      if (form.artist) formData.append("artist", form.artist);
    }
    if (form.type === "posts") formData.append("text", form.text);

    const res = await fetch(`/api/${form.type}/add`, {
      method: "POST",
      body: formData,
    });

    setLoading(false); // stop loader

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      alert("Failed to upload!");
      return;
    }

    alert("Upload successful!");
    setForm({ type: "fanart", title: "", text: "", source: "", artist: "", image: null });

    // redirect to home after short delay
    router.push("/");
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Content
          </Typography>
          {!isMember ? (
            <Typography color="error">
              You must be a cultist to upload.
            </Typography>
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                select
                label="Upload Type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <MenuItem value="fanart">Fanart</MenuItem>
                <MenuItem value="posts">Post</MenuItem>
                <MenuItem value="screenshot">Screenshot</MenuItem>
                <MenuItem value="sesbian">Sesbian</MenuItem>
              </TextField>

              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              {form.type === "fanart" && (
                <>
                  <TextField
                    label="Source"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Artist"
                    name="artist"
                    value={form.artist}
                    onChange={handleChange}
                  />
                </>
              )}

              {form.type === "posts" && (
                <TextField
                  label="Post Content"
                  name="text"
                  value={form.text}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              )}

              <Button variant="outlined" component="label" disabled={loading}>
                Select Image
                <input type="file" hidden name="image" onChange={handleChange} />
              </Button>
              {form.image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {form.image.name} (
                  {(form.image.size / 1024).toFixed(2)} KB)
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

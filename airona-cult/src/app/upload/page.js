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

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "fanart", // fanart, screenshot, sesbian
    title: "",
    source: "",
    artist: "",
    image: null,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/check-admin");
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
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
    if (!isAdmin) {
      alert("You must be an admin to upload!");
      return;
    }

    if (!form.image) {
      alert("Please select an image to upload!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("image", form.image);
    
    if (form.type === "fanart") {
      if (form.source) formData.append("source", form.source);
      if (form.artist) formData.append("artist", form.artist);
    }

    const res = await fetch(`/api/${form.type}/add`, {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      alert(err.error || "Failed to upload!");
      return;
    }

    alert("Upload successful!");
    setForm({ type: "fanart", title: "", source: "", artist: "", image: null });

    // redirect to gallery after short delay
    setTimeout(() => {
      router.push("/gallery");
    }, 500);
  };

  if (status === "loading" || checkingAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Content
          </Typography>
          {!isAdmin ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error" variant="h6" gutterBottom>
                Admin Access Required
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You must be an admin to upload content.
              </Typography>
            </Box>
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

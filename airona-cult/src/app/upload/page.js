// app/upload/page.js
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
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [isMember, setIsMember] = useState(false);
  const [form, setForm] = useState({
    type: "fanart", // fanart, post, screenshot
    title: "",
    text: "",
    source: "",
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

    if (!form.image) {
      alert("Please select an image.");
      return;
    }

    const filePath = `${form.type}/${Date.now()}-${form.image.name}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(form.type) // bucket matches type
      .upload(filePath, form.image);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed!");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from(form.type)
      .getPublicUrl(filePath);

    // Insert into the correct table
    const insertData = {
      title: form.title,
      image_url: publicUrl.publicUrl,
      author: session.user.id,
    };

    if (form.type === "fanart") {
      insertData.source = form.source;
      insertData.author = session.user.name; // fanart author is text
    } else if (form.type === "posts") {
      insertData.text = form.text;
    }

    const { error: insertError } = await supabase
      .from(form.type)
      .insert([insertData]);

    if (insertError) {
      console.error(insertError);
      alert("Failed to save record!");
      return;
    }

    alert("Upload successful!");
    setForm({ type: "fanart", title: "", text: "", source: "", image: null });
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
              You must be a guild member to upload.
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
              </TextField>

              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />

              {form.type === "fanart" && (
                <TextField
                  label="Source"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                />
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

              <Button variant="outlined" component="label">
                Select Image
                <input type="file" hidden name="image" onChange={handleChange} />
              </Button>

              <Button type="submit" variant="contained" color="primary">
                Upload
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

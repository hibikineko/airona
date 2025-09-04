// app/admin/members/page.js
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
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";

// replace this with YOUR Discord ID (owner)
const OWNER_ID = process.env.DISCORD_OWNER_ID;

export default function AddMemberPage() {
  const { data: session, status } = useSession();
  const [allowed, setAllowed] = useState(false);
  const [form, setForm] = useState({
    discord_id: "",
    username: "",
    name: "",
    role_priority: 0,
  });
  console.log("SESSION DATA:", session);


  useEffect(() => {
    if (session?.user?.id === OWNER_ID) {
      setAllowed(true);
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/members/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (res.ok) {
      alert("Member added successfully!");
      setForm({ discord_id: "", username: "", name: "", role_priority: 0 });
    } else {
      alert(result.error || "Failed to add member");
    }
  };


  if (status === "loading") return <p>Loading...</p>;

  if (!allowed) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography color="error">
          You do not have permission to access this page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add New Member
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Discord ID"
              name="discord_id"
              value={form.discord_id}
              onChange={handleChange}
              required
            />
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
            <TextField
              label="Role Priority"
              name="role_priority"
              type="number"
              value={form.role_priority}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Add Member
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

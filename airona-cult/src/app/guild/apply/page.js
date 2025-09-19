// src/app/apply/page.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";

const playstyleOptions = ["Casual", "Semi", "Comp"];
const classOptions = [
  "Frost Mage",
  "Shield Knight",
  "Heavy Guardian",
  "Marksman",
  "Verdant Oracle",
  "Beat Performer",
  "Wind Knight",
  "Stormblade",
];
const ageOptions = ["13-20", "21-30", "30+"];

export default function ApplyPage() {
  const [form, setForm] = useState({
    discord_username: "",
    planned_ingame_name: "",
    timezone: "",
    active_time: "",
    playstyle: "",
    planned_main_class: "",
    favourite_bpsr_activity: "", // ✅ corrected
    how_found_guild: "", // ✅ corrected
    why_join_guild: "", // ✅ corrected
    interested_in_events: false, // ✅ boolean
    age_range: "",
    birthday: "",
    other_questions: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // ✅ new success state
  const [alreadyApplied, setAlreadyApplied] = useState(false);


  // Snackbar state for errors
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    if (localStorage.getItem("hasApplied") === "true") {
        setAlreadyApplied(true);
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setForm((prev) => ({ ...prev, timezone: tz }));
    } catch (e) {
      console.log("Timezone detection failed:", e);
    }
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    if (alreadyApplied) {
    setSnackbar({
        open: true,
        message: "You have already submitted the application!",
        severity: "warning",
    });
    return;
    }

    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");

      setSuccess(true); // ✅ show success card
      if(res.ok){
        localStorage.setItem("hasApplied", "true");
        setAlreadyApplied(true);
      }
      


      setForm({
        discord_username: "",
        planned_ingame_name: "",
        timezone: form.timezone,
        active_time: "",
        playstyle: "",
        planned_main_class: "",
        favourite_bpsr_activity: "",
        how_found_guild: "",
        why_join_guild: "",
        interested_in_events: false,
        age_range: "",
        birthday: "",
        other_questions: "",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error: " + err.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelProps = {
    shrink: true,
    sx: { fontSize: "1.05rem", fontWeight: 700 },
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: "100%",
            textAlign: "center",
            p: 4,
          }}
        >
          <Image
            src="/airona/airona6.png"
            alt="Airona Sticker"
            width={180}
            height={180}
            style={{ margin: "0 auto 16px" }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            ✅ Thanks for submitting!
          </Typography>
          <Typography gutterBottom>
            If you haven’t yet, join our Discord:
          </Typography>
          <Typography>
            <a
              href="https://discord.gg/airona"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#5865F2", fontWeight: "bold" }}
            >
              discord.gg/airona
            </a>
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Please wait while your application is reviewed.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 950 },
          transform: { xs: "scale(1)", md: "scale(1.05)" },
          transition: "transform 0.3s ease",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" }, fontWeight: 700 }}
          >
            Guild Application
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
            noValidate
          >
            <TextField
              label="Discord Username"
              name="discord_username"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.discord_username}
              onChange={handleChange}
              inputProps={{ maxLength: 32 }}
              helperText="Example: hibikineko"
            />

            <TextField
              label="Planned In-game Name"
              name="planned_ingame_name"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.planned_ingame_name}
              onChange={handleChange}
              inputProps={{ maxLength: 12 }}
              helperText="Max 12 characters, no spaces"
            />

            <TextField
              label="Timezone"
              name="timezone"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.timezone}
              onChange={handleChange}
              helperText="Auto-detected but you can edit"
            />

            <TextField
              label="Most Active Playing Time"
              name="active_time"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.active_time}
              onChange={handleChange}
              inputProps={{ maxLength: 40 }}
              placeholder="e.g. 8pm to 12am"
            />

            <TextField
              select
              label="Playstyle"
              name="playstyle"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.playstyle}
              onChange={handleChange}
            >
              {playstyleOptions.map((opt) => (
                <MenuItem key={opt} value={opt.toLowerCase()}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Planned Main Class"
              name="planned_main_class"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.planned_main_class}
              onChange={handleChange}
            >
              {classOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Favourite Thing to Do in BPSR"
              name="favourite_bpsr_activity"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.favourite_bpsr_activity}
              onChange={handleChange}
              inputProps={{ maxLength: 100 }}
              placeholder="e.g. character customization"
            />

            <TextField
              label="How Did You Find Our Guild?"
              name="how_found_guild"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.how_found_guild}
              onChange={handleChange}
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="Why Do You Want to Join?"
              name="why_join_guild"
              fullWidth
              required
              multiline
              minRows={3}
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.why_join_guild}
              onChange={handleChange}
              inputProps={{ maxLength: 300 }}
            />

            <TextField
              select
              label="Interested in Social Guild Events?"
              name="interested_in_events"
              fullWidth
              required
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.interested_in_events}
              onChange={handleChange}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </TextField>

            <Typography
              variant="h6"
              sx={{
                mt: 3,
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                fontWeight: 700,
              }}
            >
              Personal (Optional)
            </Typography>

            <TextField
              select
              label="Age Range"
              name="age_range"
              fullWidth
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.age_range}
              onChange={handleChange}
            >
              {ageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Birthday"
              name="birthday"
              fullWidth
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.birthday}
              onChange={handleChange}
              inputProps={{ maxLength: 40 }}
              placeholder="e.g. July 31"
            />

            <TextField
              label="Any Other Questions"
              name="other_questions"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              InputLabelProps={labelProps}
              value={form.other_questions}
              onChange={handleChange}
              inputProps={{ maxLength: 300 }}
            />

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: 220, fontSize: "1rem", py: 1.2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Application"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ❌ Snackbar only for errors */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

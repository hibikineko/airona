"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    discord_id: "",
    username: "",
    name: "",
    role_priority: 0,
  });

  // Fetch members from API
  const fetchMembers = async () => {
    const res = await fetch("/api/members/list");
    if (res.ok) {
      const data = await res.json();
      setMembers(data);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Add member
  const handleAdd = async () => {
    const res = await fetch("/api/members/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ discord_id: "", username: "", name: "", role_priority: 0 });
      fetchMembers();
    } else {
      alert("Error adding member");
    }
  };

  // Delete member
  const handleDelete = async (id) => {
    const res = await fetch(`/api/members/delete?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchMembers();
    } else {
      alert("Error deleting member");
    }
  };

  // Update member role priority (quick example)
  const handleUpdate = async (id, newPriority) => {
    const res = await fetch(`/api/members/update?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role_priority: newPriority }),
    });

    if (res.ok) {
      fetchMembers();
    } else {
      alert("Error updating member");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        ➕ Add Member
      </Button>

      {/* Members Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Discord ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.discord_id}</TableCell>
                <TableCell>{member.username}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.role_priority}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() =>
                      handleUpdate(member.id, member.role_priority + 1)
                    }
                  >
                    + Role
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(member.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Member Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <TextField
            label="Discord ID"
            fullWidth
            margin="dense"
            value={form.discord_id}
            onChange={(e) => setForm({ ...form, discord_id: e.target.value })}
          />
          <TextField
            label="Username"
            fullWidth
            margin="dense"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Role Priority"
            type="number"
            fullWidth
            margin="dense"
            value={form.role_priority}
            onChange={(e) =>
              setForm({ ...form, role_priority: parseInt(e.target.value, 10) })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

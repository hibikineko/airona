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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [isMember, setIsMember] = useState(false);
  const [applications, setApplications] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [discordIdInput, setDiscordIdInput] = useState("");

  // ✅ Check membership
  useEffect(() => {
    const checkMembership = async () => {
      if (!session?.user) return;
      const discordId = session.user.id;

      const { data } = await supabase
        .from("members")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle();

      if (data) setIsMember(true);
    };
    checkMembership();
  }, [session]);

  // ✅ Fetch applications + approved members
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appsRes, approvedRes] = await Promise.all([
          fetch("/api/applications"),
          supabase.from("approved_members").select("application_id"),
        ]);

        if (!appsRes.ok) throw new Error("Failed to fetch applications");

        const appsData = await appsRes.json();
        const approvedIds = approvedRes.data?.map((a) => a.application_id) || [];

        setApplications(appsData);
        setApproved(approvedIds);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (isMember) {
      fetchData();
    }
  }, [isMember]);

  // ✅ Export to Excel
  const exportToExcel = () => {
    if (!applications.length) return;
    const worksheet = XLSX.utils.json_to_sheet(applications);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "applications.xlsx");
  };

  // ✅ Approve flow
  const handleApproveClick = (app) => {
    setSelectedApp(app);
    setDialogOpen(true);
  };

  const confirmApprove = async () => {
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discord_id: discordIdInput, application: selectedApp }),
      });

      if (!res.ok) throw new Error("Failed to approve");
      setApproved((prev) => [...prev, selectedApp.id]); // mark approved
    } catch (err) {
      console.error(err);
    } finally {
      setDialogOpen(false);
      setDiscordIdInput("");
      setSelectedApp(null);
    }
  };

  // ✅ Filtering + Pagination
  const filteredApps = applications.filter((app) =>
    Object.values(app).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const paginatedApps = filteredApps.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (status === "loading") return <p>Loading...</p>;

  return (
    <Container maxWidth={false} sx={{ mt: 4, width: "100%" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Guild Applications
          </Typography>

          {!isMember ? (
            <Typography color="error">
              You must be a cultist to view applications.
            </Typography>
          ) : loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Search + Export */}
              <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={exportToExcel}
                  disabled={!applications.length}
                >
                  Export to Excel
                </Button>
              </Box>

              {/* Applications Table */}
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {applications.length > 0 &&
                        Object.keys(applications[0])
                          .filter((col) => col !== "id" && col !== "created_at")
                          .map((col) => (
                            <TableCell key={col}>
                              {col
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </TableCell>
                          ))}
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedApps.map((row, i) => (
                      <TableRow key={i}>
                        {Object.entries(row)
                          .filter(([col]) => col !== "id" && col !== "created_at")
                          .map(([col, val], j) => (
                            <TableCell key={j}>
                              {typeof val === "boolean" ? (val ? "Yes" : "No") : val ?? ""}
                            </TableCell>
                          ))}
                        <TableCell>
                          {approved.includes(row.id) ? (
                            <Button variant="outlined" disabled>
                              Already Approved
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleApproveClick(row)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={filteredApps.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Approve Application</DialogTitle>
        <DialogContent>
          <TextField
            label="Discord ID"
            fullWidth
            value={discordIdInput}
            onChange={(e) => setDiscordIdInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmApprove}
            variant="contained"
            color="primary"
            disabled={!discordIdInput}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

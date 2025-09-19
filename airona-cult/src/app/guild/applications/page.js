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
} from "@mui/material";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ApplicationsPage() {
  const { data: session, status } = useSession();
  const [isMember, setIsMember] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Check membership
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

 useEffect(() => {
    const fetchApplications = async () => {
        setLoading(true);
        try {
        const res = await fetch("/api/applications"); // ✅ now works
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setApplications(data);
        } catch (err) {
        console.error(err);
        }
        setLoading(false);
    };

    if (isMember) {
        fetchApplications();
    }
    }, [isMember]);



  // Export to Excel (full dataset)
  const exportToExcel = () => {
    if (!applications.length) return;

    const worksheet = XLSX.utils.json_to_sheet(applications);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "applications.xlsx");
  };

  // Search + filter
  const filteredApps = applications.filter((app) =>
    Object.values(app).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
              {/* Search + Export Controls */}
              <Box display="flex" justifyContent="space-between" mb={2}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0); // reset to first page on search
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
              <Table>
                <TableHead>
                  <TableRow>
                    {applications.length > 0 &&
                      Object.keys(applications[0]).map((col) => (
                        <TableCell key={col}>{col}</TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedApps.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val, j) => (
                        <TableCell key={j}>
                          {val !== null ? val.toString() : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </Container>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CircularProgress,
  Button,
  Dialog,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SesbianGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openImage, setOpenImage] = useState(null);

  const PAGE_SIZE = 8; // load more per page so it fills 4x2 grid faster

  // Client-side API fetch function
  const fetchSesbianData = async (pageIndex, pageSize) => {
    const response = await fetch(`/api/content/sesbian?page=${pageIndex}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch sesbian: ${response.status}`);
    }
    const result = await response.json();
    return result.data || [];
  };

  const loadMore = async (pageIndex) => {
    setLoading(true);

    try {
      const newItems = await fetchSesbianData(pageIndex, PAGE_SIZE);

      if (newItems.length > 0) {
        if (pageIndex === 0) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }
        setPage(pageIndex);
      }
    } catch (err) {
      console.error("Failed to fetch sesbian:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inititalLoad = async () => {
      setLoading(true);
      try {
        const newItems = await fetchSesbianData(0, PAGE_SIZE);
        if (newItems.length > 0) {
          setItems(newItems);
          setPage(0);
        }
      } catch (err) {
        console.error("Failed to fetch sesbian:", err);
      } finally {
        setLoading(false);
      }
    };
    
    inititalLoad();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        💕 Sesbian Gallery
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {items.map((img) => (
          <Grid
            item
            key={img.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              sx={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <CardActionArea onClick={() => setOpenImage(img.image_url)}>
                <Box sx={{ position: "relative", width: "100%", height: 220 }}>
                  <img
                    src={img.image_url}
                    alt={img.title || "Sesbian"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      bgcolor: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      p: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {img.title || "Untitled"}
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {items.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            onClick={() => loadMore(page + 1)}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}

      {/* Full-size image dialog */}
      <Dialog
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setOpenImage(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "#fff",
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {openImage && (
            <img
              src={openImage}
              alt="Full size"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Dialog>
    </Container>
  );
}
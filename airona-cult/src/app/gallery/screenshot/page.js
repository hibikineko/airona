"use client";

import { useEffect, useState, useCallback } from "react";
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
import { fetchScreenshots } from "@/lib/fetchContent";

export default function ScreenshotGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openImage, setOpenImage] = useState(null);

  const PAGE_SIZE = 8; // load more per page so it fills 4x2 grid faster

  const loadMore = useCallback(
    async (pageIndex) => {
      setLoading(true);

      try {
        const newItems = await fetchScreenshots(pageIndex, PAGE_SIZE);

        if (newItems.length > 0) {
          if (pageIndex === 0) {
            setItems(newItems);
          } else {
            setItems((prev) => [...prev, ...newItems]);
          }
          setPage(pageIndex);
        }
      } catch (err) {
        console.error("Failed to fetch screenshots:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMore(0);
  }, [loadMore]);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        📸 Screenshot Gallery
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
                    alt={img.title || "Screenshot"}
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
                      variant="subtitle2"
                      sx={{ fontWeight: 500, fontSize: "0.85rem" }}
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

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          onClick={() => loadMore(page + 1)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Load More"}
        </Button>
      </Box>

      {/* Lightbox */}
      <Dialog open={!!openImage} onClose={() => setOpenImage(null)} maxWidth="lg">
        <Box sx={{ position: "relative", bgcolor: "black" }}>
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              zIndex: 10,
            }}
            onClick={() => setOpenImage(null)}
          >
            <CloseIcon />
          </IconButton>
          {openImage && (
            <img
              src={openImage}
              alt="Large view"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}
        </Box>
      </Dialog>
    </Container>
  );
}

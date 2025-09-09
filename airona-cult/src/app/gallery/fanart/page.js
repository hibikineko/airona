"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Button,
  Link,
  Dialog,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchFanart } from "@/lib/fetchContent";

export default function FanartGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [openImage, setOpenImage] = useState(null);

  const PAGE_SIZE = 8; // load in multiples of 4 so the grid fills nicely

  const loadMore = async (pageIndex) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const newItems = await fetchFanart(pageIndex, PAGE_SIZE);
      if (!newItems || newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage(pageIndex + 1);
      }
    } catch (err) {
      console.error("Failed to fetch fanart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore(0);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        🎨 Fanart Gallery
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {items.map((img, i) => (
          <Grid
            item
            key={i}
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
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
              }}
            >
              <CardActionArea onClick={() => setOpenImage(img.image_url)}>
                <Box sx={{ position: "relative", width: "100%", height: 220 }}>
                  <img
                    src={img.image_url}
                    alt={img.title || "Fanart"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {img.title && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        bgcolor: "rgba(0,0,0,0.4)",
                        color: "#fff",
                        p: 0.5,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 500, fontSize: "0.85rem" }}
                      >
                        {img.title}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardActionArea>
              {img.source && (
                <CardContent sx={{ textAlign: "center", pt: 1 }}>
                  <Link
                    href={img.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    variant="body2"
                  >
                    Source
                  </Link>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={4}>
        {hasMore ? (
          <Button
            variant="contained"
            onClick={() => loadMore(page)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Load More"}
          </Button>
        ) : (
          <Typography variant="subtitle1" color="text.secondary">
            No more fanart to show.
          </Typography>
        )}
      </Box>

      {/* Lightbox */}
      <Dialog open={!!openImage} onClose={() => setOpenImage(null)} maxWidth="lg">
        <Box sx={{ position: "relative", bgcolor: "black" }}>
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8, color: "white", zIndex: 10 }}
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

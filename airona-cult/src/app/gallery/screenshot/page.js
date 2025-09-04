"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
} from "@mui/material";
import { fetchScreenshots } from "@/lib/fetchContent";

export default function ScreenshotGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 12;

  const loadMore = useCallback(
    async (pageIndex) => {
      setLoading(true);

      try {
        const newItems = await fetchScreenshots(pageIndex, PAGE_SIZE);

        if (pageIndex === 0) {
          setItems(newItems);
        } else {
          setItems((prev) => [...prev, ...newItems]);
        }

        setPage(pageIndex);
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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        📸 Screenshot Gallery
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {items.map((img) => (
          <Grid
            item
            key={img.id}
            sx={{
              flexGrow: 1,
              minWidth: 400, // minimum width per card
            }}
          >
            <Card sx={{ height: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
              <CardActionArea
                sx={{
                  height: "100%",
                  "&:hover .imageOverlay": { opacity: 0.2 },
                }}
              >
                <Box sx={{ position: "relative", width: "100%", height: 250 }}>
                  <Image
                    src={img.image_url}
                    alt={img.title || "Screenshot"}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <Box
                    className="imageOverlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "black",
                      opacity: 0,
                      transition: "opacity 0.3s",
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="subtitle1">
                    {img.title || "Untitled"}
                  </Typography>
                </CardContent>
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
    </Container>
  );
}

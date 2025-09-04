"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import { fetchFanart } from "@/lib/fetchContent";

export default function FanartGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 12;

  useEffect(() => {
    loadMore(0);
  }, []);

  const loadMore = async (pageIndex = page) => {
    if (loading) return;
    setLoading(true);

    const newItems = await fetchFanart(PAGE_SIZE * (pageIndex + 1));

    if (!newItems || newItems.length === 0) {
      setHasMore(false);
    } else {
      // Append new items instead of replacing
      setItems((prev) => [...prev, ...newItems.slice(prev.length)]);
      setPage(pageIndex + 1);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        🎨 Fanart Gallery
      </Typography>

      <Grid container spacing={3}>
        {items.map((img, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                pt: "75%", // 4:3 aspect ratio
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <Image
                src={img.image_url}
                alt={img.title || "Fanart"}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </Box>
            {img.title && (
              <Typography variant="subtitle1" align="center" mt={1}>
                {img.title}
              </Typography>
            )}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Load More"
            )}
          </Button>
        ) : (
          <Typography variant="subtitle1" color="text.secondary">
            No more fanart to show.
          </Typography>
        )}
      </Box>
    </Container>
  );
}

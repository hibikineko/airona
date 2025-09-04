"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import { fetchScreenshots } from "@/lib/fetchContent";

export default function ScreenshotGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 12;

  // stable fetch function
  const loadMore = useCallback(
    async (pageIndex) => {
      setLoading(true);

      const newItems = await fetchScreenshots(pageIndex, PAGE_SIZE);
      alert(pageIndex)
      console.log(newItems);

      if (pageIndex === 0) {
        // first load
        setItems(newItems);
      } else {
        // append next page
        setItems((prev) => [...prev, ...newItems]);
      }

      setPage(pageIndex);
      setLoading(false);
    },
    []
  );

  // run only once on mount
  useEffect(() => {
    loadMore(0);
  }, [loadMore]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        📸 Screenshot Gallery
      </Typography>

      <Grid container spacing={3}>
        {items.map((img, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 300,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
              }}
            >
              <Image
                src={img.image_url}
                alt={img.title || "Screenshot"}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </Box>
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

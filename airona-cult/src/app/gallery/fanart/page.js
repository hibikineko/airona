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
  Link,
} from "@mui/material";
import { fetchFanart } from "@/lib/fetchContent";

export default function FanartGallery() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 12;

  const loadMore = useCallback(
    async (pageIndex) => {
      if (loading) return;
      setLoading(true);

      try {
        const newItems = await fetchFanart(PAGE_SIZE * (pageIndex + 1));
        if (!newItems || newItems.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => [...prev, ...newItems.slice(prev.length)]);
          setPage(pageIndex + 1);
        }
      } catch (err) {
        console.error("Failed to fetch fanart:", err);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  useEffect(() => {
    loadMore(0);
  }, [loadMore]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" align="center" gutterBottom>
        🎨 Fanart Gallery
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {items.map((img, i) => (
          <Grid
            item
            key={i}
            sx={{
              flexGrow: 1,
              minWidth: 400, // minimum width per card
            }}
          >
            <Card
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
              }}
            >
              <CardActionArea sx={{ height: "100%" }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    pt: "75%", // 4:3 aspect ratio
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={img.image_url}
                    alt={img.title || "Fanart"}
                    fill
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.3s",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "black",
                      opacity: 0,
                      transition: "opacity 0.3s",
                      "&:hover": { opacity: 0.2 },
                    }}
                  />
                </Box>
                <CardContent sx={{ textAlign: "center" }}>
                  {img.title && (
                    <Typography variant="subtitle1">{img.title}</Typography>
                  )}
                  {img.source && (
                    <Link
                      href={img.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      variant="body2"
                    >
                      Source
                    </Link>
                  )}
                </CardContent>
              </CardActionArea>
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
    </Container>
  );
}

"use client";

import { useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { Card, CardContent, Typography, Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ContentCarousel({ title, items, type }) {
  const [openImage, setOpenImage] = useState(null); // holds image URL to show in dialog

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      <Slider {...settings}>
        {items.map((item) => (
          <Box key={item.id} px={1}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}>
              {item.image_url && (
                <Box
                  sx={{ position: "relative", width: "100%", height: 0, paddingTop: "62.5%" }}
                  onClick={() => setOpenImage(item.image_url)}
                >
                  <Image
                    src={item.image_url}
                    alt={item.title || "content"}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      p: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2">{item.title || "Untitled"}</Typography>
                  </Box>
                </Box>
              )}
              {type === "posts" && (
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">{item.text}</Typography>
                </CardContent>
              )}
              {type === "fanart" && (
                <CardContent sx={{ flexGrow: 1 }}>
                  {item.source ? (
                    <Typography variant="caption">
                      Source:{" "}
                      <a href={item.source} target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2" }}>
                        {item.source}
                      </a>
                    </Typography>
                  ) : (
                    <Typography variant="caption">Source: N/A</Typography>
                  )}
                </CardContent>
              )}
            </Card>
          </Box>
        ))}
      </Slider>

      {/* Image Lightbox */}
      <Dialog
        open={!!openImage}
        onClose={() => setOpenImage(null)}
        maxWidth="lg"
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 10 }}
            onClick={() => setOpenImage(null)}
          >
            <CloseIcon />
          </IconButton>
          {openImage && (
            <Image
              src={openImage}
              alt="Large view"
              width={1200}
              height={1200}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          )}
        </Box>
      </Dialog>
    </div>
  );
}

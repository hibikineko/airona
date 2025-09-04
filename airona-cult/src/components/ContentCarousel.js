"use client";

import Slider from "react-slick";
import Image from "next/image";
import { Card, CardContent, Typography, Box } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ContentCarousel({ title, items, type }) {
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
          <Box key={item.id} px={1}> {/* spacing between slides */}
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {item.image_url && (
                <Box sx={{ position: "relative", width: "100%", height: 0, paddingTop: "62.5%" }}>
                  <Image
                    src={item.image_url}
                    alt={item.title || "content"}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  {/* Title overlay on image */}
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
                    <Typography variant="subtitle2">
                      {item.title || "Untitled"}
                    </Typography>
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
                  <Typography variant="caption">
                    By {item.author} | Source: {item.source || "N/A"}
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Box>
        ))}
      </Slider>
    </div>
  );
}

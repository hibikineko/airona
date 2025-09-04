"use client";

import Slider from "react-slick";
import Image from "next/image";
import { Card, CardContent, Typography } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ContentCarousel({ title, items, type }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
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
          <Card key={item.id} sx={{ m: 1 }}>
            {item.image_url && (
              <Image
                src={item.image_url}
                alt={item.title || "content"}
                width={400}
                height={250}
                style={{ objectFit: "cover" }}
              />
            )}
            <CardContent>
              <Typography variant="subtitle1">
                {item.title || "Untitled"}
              </Typography>
              {type === "posts" && (
                <Typography variant="body2">{item.text}</Typography>
              )}
              {type === "fanart" && (
                <Typography variant="caption">
                  By {item.author} | Source: {item.source || "N/A"}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Slider>
    </div>
  );
}

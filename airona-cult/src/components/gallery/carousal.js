import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import Image from "next/image";

const Carousal = ({ imageUrls = [] }) => {
    const [current, setCurrent] = useState(0);
    const total = Math.min(imageUrls.length, 5);

    useEffect(() => {
        if (total === 0) return;
        const timer = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, 5000);
        return () => clearTimeout(timer);
    }, [current, total]);

    const handlePrev = () => {
        setCurrent((prev) => (prev - 1 + total) % total);
    };

    const handleNext = () => {
        setCurrent((prev) => (prev + 1) % total);
    };

    if (total === 0) {
        return (
            <Box sx={{ textAlign: "center", p: 2 }}>
                No images to display.
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                maxWidth: 600,
                mx: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: "background.paper",
            }}
        >
            <IconButton
                aria-label="previous"
                onClick={handlePrev}
                sx={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    bgcolor: "rgba(255,255,255,0.7)",
                }}
            >
                <ArrowBackIos />
            </IconButton>
            <Box
                sx={{
                    width: "100%",
                    height: { xs: 200, sm: 350 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Image
                    src={imageUrls[current]}
                    alt={`carousel-img-${current}`}
                    width={800}
                    height={600}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                />
            </Box>
            <IconButton
                aria-label="next"
                onClick={handleNext}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    bgcolor: "rgba(255,255,255,0.7)",
                }}
            >
                <ArrowForwardIos />
            </IconButton>
        </Box>
    );
};

Carousal.propTypes = {
    imageUrls: PropTypes.arrayOf(PropTypes.string),
};

export default Carousal;
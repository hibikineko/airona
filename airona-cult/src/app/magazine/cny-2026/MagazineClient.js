"use client";

import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress, Typography, useMediaQuery, useTheme as useMuiTheme } from "@mui/material";
import HTMLFlipBook from "react-pageflip";
import CoverPage from "@/components/magazine/layouts/CoverPage";
import BackCover from "@/components/magazine/layouts/BackCover";
import OutfitShowcase from "@/components/magazine/layouts/OutfitShowcase";
import FourImageGrid from "@/components/magazine/layouts/FourImageGrid";
import AsymmetricLayout from "@/components/magazine/layouts/AsymmetricLayout";
import FullImagePage from "@/components/magazine/layouts/FullImagePage";

const layoutComponents = {
  "cover": CoverPage,
  "back-cover": BackCover,
  "outfit-showcase": OutfitShowcase,
  "four-grid": FourImageGrid,
  "asymmetric": AsymmetricLayout,
  "full-image": FullImagePage,
};

export default function MagazineClient({ content, theme }) {
  const [loading, setLoading] = useState(true);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  useEffect(() => {
    // Simulate loading magazine
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
        }}
      >
        <CircularProgress size={60} sx={{ color: theme.colors.secondary, mb: 3 }} />
        <Typography variant="h5" sx={{ color: theme.colors.lightText }}>
          Loading {content.issue}...
        </Typography>
      </Box>
    );
  }

  return isMobile ? (
    <MobileMagazine content={content} theme={theme} />
  ) : (
    <DesktopMagazine content={content} theme={theme} />
  );
}

// Desktop Flip Book
function DesktopMagazine({ content, theme }) {
  const [dimensions, setDimensions] = useState({ width: 700, height: 900 });
  const [containerHeight, setContainerHeight] = useState("100vh");
  const bookRef = useRef(null);

  useEffect(() => {
    const calculateDimensions = () => {
      // Get actual header height
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 80;
      const verticalPadding = 10;
      const availableHeight = window.innerHeight - headerHeight - verticalPadding;
      
      // Portrait page ratio - each page is 0.7 width-to-height
      const pageHeight = availableHeight;
      const pageWidth = pageHeight * 0.7;
      
      setDimensions({
        width: Math.floor(pageWidth),
        height: Math.floor(pageHeight),
      });
      
      // Set container height to remaining viewport
      setContainerHeight(`${availableHeight}px`);
    };

    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);
    return () => window.removeEventListener("resize", calculateDimensions);
  }, []);

  const onFlip = (e) => {
    // Prevent flipping beyond the last page
    if (e.data >= content.pages.length - 1) {
      return;
    }
  };

  return (
    <Box
      sx={{
        height: containerHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.primary}10)`,
        overflow: "hidden",
      }}
    >
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={400}
        maxWidth={3000}
        minHeight={500}
        maxHeight={3000}
        showCover={true}
        mobileScrollSupport={false}
        className="magazine-flipbook"
        useMouseEvents={true}
        swipeDistance={30}
        clickEventForward={true}
        drawShadow={true}
        flippingTime={800}
        autoSize={false}
        maxShadowOpacity={0.5}
        onFlip={onFlip}
        ref={bookRef}
      >
        {content.pages.map((page, index) => {
          const LayoutComponent = layoutComponents[page.type];
          return (
            <Box
              key={page.id}
              className="magazine-page"
              sx={{
                background: "white",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.1)",
                width: "100%",
                height: "100%",
              }}
            >
              {LayoutComponent && (
                <LayoutComponent data={page.data} theme={theme} />
              )}
            </Box>
          );
        })}
      </HTMLFlipBook>
    </Box>
  );
}

// Mobile Scroll
function MobileMagazine({ content, theme }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.colors.background,
      }}
    >
      {content.pages.map((page, index) => {
        const LayoutComponent = layoutComponents[page.type];
        return (
          <Box
            key={page.id}
            sx={{
              height: "100vh",
              width: "100vw",
              background: "white",
              mb: index < content.pages.length - 1 ? 2 : 0,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {LayoutComponent && (
              <LayoutComponent data={page.data} theme={theme} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

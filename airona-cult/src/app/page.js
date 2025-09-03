"use client";

import { Button, Card, CardContent, Typography, Box, Link } from "@mui/material";
import Carousal from "@/components/gallery/carousal";
import CommunityPosts from "@/components/gallery/communityPosts";

let sampleImages = [
  "/airona/personal1.png",
  "/airona/personal2.png",
  "/airona/personal3.png",
  "/airona/personal4.png",
  "/airona/personal5.png",
];

// Sample fan art data
let fanArts = [
  {
    url: "/airona/personal1.png",
    artist: "ArtistOne",
    source: "https://deviantart.com/artistone/art/airona-fanart1",
  },
  {
    url: "/airona/personal2.png",
    artist: "ArtistTwo",
    source: "https://twitter.com/artisttwo/status/123456789",
  },
  {
    url: "/airona/personal3.png",
    artist: "ArtistThree",
    source: "https://instagram.com/p/abcdefg",
  },
];

// Sample community posts
let samplePosts = [
  {
    ownerProfilePic: "/profiles/user1.png",
    ownerName: "Abhi",
    title: "My First Adventure",
    text: "Had an amazing time exploring the new area with Airona!",
    url: "/posts/adventure1.png",
    type: "image",
  },
  {
    ownerProfilePic: "/profiles/user2.png",
    ownerName: "Mira",
    title: "Tips for Beginners",
    text: "Here are some tips for new players to get started.",
    url: "",
    type: "text",
  },
  {
    ownerProfilePic: "/profiles/user3.png",
    ownerName: "Leo",
    title: "Hidden Locations",
    text: "Found a secret spot! Check out the screenshot.",
    url: "/posts/hidden-location.png",
    type: "image",
  },
];

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <Card>
        <CardContent>
          <Typography variant="h3" gutterBottom>
            Welcome to the Airona Fan Site 🌿
          </Typography>
          <Typography variant="body1">
            A community hub for fan art, screenshots, and adventures with Airona!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: "1rem" }}
          >
            Explore Gallery
          </Button>
        </CardContent>
      </Card>

      {/* Carousal Section */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Community Screenshots
            </Typography>
            <Carousal imageUrls={sampleImages} />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="primary"
                href="/gallery"
              >
                View More
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Fan Art Section */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Airona Fan Arts
            </Typography>
            {/* Use Carousal for fan arts */}
            <Carousal
              imageUrls={fanArts.map((art) => art.url)}
              renderCaption={(idx) => (
                <Typography variant="subtitle2" mt={1} textAlign="center">
                  by{" "}
                  <Link href={fanArts[idx].source} target="_blank" rel="noopener">
                    {fanArts[idx].artist}
                  </Link>
                </Typography>
              )}
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="primary"
                href="/fanart"
              >
                View More Fan Arts
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Community Posts Section */}
      <Box mt={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Community Posts
            </Typography>
            <CommunityPosts posts={samplePosts} />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="primary"
                href="/community"
              >
                View More Posts
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </main>
  );
}

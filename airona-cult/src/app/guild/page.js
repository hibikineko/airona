"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Paper,
  Link,
} from "@mui/material";
import Image from "next/image";
import RitualButton from "@/components/button/ritualButton";

const steps = [
  {
    gif: "/airona/creepy1.gif",
    question: "Are you ready to worship Airona?",
  },
  {
    gif: "/airona/creepy2.gif",
    question: "Are you ready to give everything including your soul to Airona?",
  },
];

export default function GuildPage() {
  const [step, setStep] = useState(0);

  if (step < steps.length) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          bgcolor: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          zIndex: 9999,
        }}
      >
        <Image
          src={steps[step].gif}
          alt="Cult Initiation"
          fill
          style={{ objectFit: "cover", opacity: 0.7 }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            p: 3,
          }}
        >
          <Typography
            variant="h4"
            color="white"
            gutterBottom
            sx={{ textShadow: "0 0 8px #ff0000, 0 0 16px #660000" }}
          >
            {steps[step].question}
          </Typography>
          <RitualButton onClick={() => setStep(step + 1)}>
            Yes, I’m ready
          </RitualButton>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Top Mascot Header */}
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Image
          src="/airona/airona2.png"
          alt="Airona Mascot"
          width={140}
          height={140}
        />
      </Box>

      {/* About Us */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            😈 About Us 😈
          </Typography>
          <Typography>
            <strong>• Guild Name:</strong> Airona Cult <br />
            <strong>• Timezone:</strong> Everyone is welcome, focus on EU/Asia{" "}
            <br />
            <strong>• Focus:</strong> Launch and Worshipping Airona <br />
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Airona Cult — the first and only guild fully dedicated to praising
            Airona, the mischievous mascot who lives for adventure… and more
            money! 💰
            <br />
            Here, we follow her teachings of chaos, curiosity, and
            coin-collecting glory.
            <br />
            Whether you’re grinding dailies or shouting <em>&quot;PRAISE AIRONA!!&quot;</em> in guild chat, you’ll fit right in.
          </Typography>
        </CardContent>
      </Card>

      {/* What We’re Looking For */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            🔮 What We’re Looking For 🔮
          </Typography>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li>
              <Typography>
                Airona Enjoyers → If you love her mischief and coin obsession,
                this is your home.
              </Typography>
            </li>
            <li>
              <Typography>
                Active Members → We need coin collectors for raids, weeklies,
                and secret stashes.
              </Typography>
            </li>
            <li>
              <Typography>
                Fun-Loving Adventurers → Banter, cheering, and plotting… for
                more money.
              </Typography>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            💎 What We Offer 💎
          </Typography>
          <ul style={{ paddingLeft: "1.5rem" }}>
            <li>
              <Typography>
                Cult of Airona → A cozy hub with stickers, art, and daily
                blessings.
              </Typography>
            </li>
            <li>
              <Typography>
                Fresh Start → Help shape this guild in Airona’s spirit from day
                one.
              </Typography>
            </li>
            <li>
              <Typography>
                Fan Website → Celebrate Airona with lore, art, and posts.
              </Typography>
            </li>
            <li>
              <Typography>
                Airona’s Blessing → Chill, welcoming energy — drama-free,
                coin-filled.
              </Typography>
            </li>
            <li>
              <Typography>
                Coin-Collecting Brotherhood → Loot, wins, or memories — hoarded
                together.
              </Typography>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* How to Join */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          📝 How to Join
        </Typography>
        <Typography sx={{ mb: 2 }}>
          • Guild applications open 1 week before launch. <br />
          • Pledge your loyalty early to secure your spot in the Cult. <br />
          • Questions? Reach out to us anytime!
        </Typography>

        <Typography sx={{ fontWeight: "bold" }}>
          🔗{" "}
          <Link
            href="https://discord.gg/SXZkEz9vmS"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="secondary"
          >
            Join our Discord Shrine
          </Link>
        </Typography>

        <Typography sx={{ mt: 1 }}>
          📩 Contact:{" "}
          <Link
            href="https://discord.com/users/hibikineko"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="secondary"
          >
            hibikineko
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

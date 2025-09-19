"use client";

import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Paper,
  Link,
  Grid,
  Button,
  Divider
} from "@mui/material";
import Image from "next/image";

export default function GuildPage() {
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
          <Typography
            variant="h4"
            gutterBottom
            textAlign="center"
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          >
            😈 About Us 😈
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography fontWeight="bold">Guild Name:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography>Airona Cult</Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              

              <Grid item xs={12} sm={4}>
                <Typography fontWeight="bold">Timezone:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography>Everyone is welcome (focus on EU/Asia)</Typography>
              </Grid>

            </Grid>
            <Grid container spacing={2}>

              <Grid item xs={12} sm={4}>
                <Typography fontWeight="bold">Focus:</Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography>Worshipping Airona and Enjoying Game!</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography paragraph>
            Airona Cult — the first and only guild fully dedicated to praising Airona,
            the mischievous mascot who lives for adventure… and more money! 💰
          </Typography>
          <Typography>
            Here, we follow her teachings of chaos, curiosity, and coin-collecting glory.
            Whether you’re grinding dailies or shouting{" "}
            <em>&quot;PRAISE AIRONA!!&quot;</em> in guild chat, you’ll fit right in.
          </Typography>
        </CardContent>
      </Card>


      {/* What We’re Looking For */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom textAlign="center">
            🔮 What We’re Looking For 🔮
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <li>
              <Typography>
                <strong>Airona Enjoyers →</strong> Love her mischief and coin
                obsession? This is your home.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Active Members →</strong> Join raids, weeklies, and help
                find secret stashes.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Fun-Loving Adventurers →</strong> Banter, cheering, and
                plotting… for more money.
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      {/* What We Offer */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom textAlign="center">
            💎 What We Offer 💎
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            <li>
              <Typography>
                <strong>Cult of Airona →</strong> Stickers, art, and daily
                blessings.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Fresh Start →</strong> Help shape this guild from day
                one.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Fan Website →</strong> Lore, art, and community posts.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Airona’s Blessing →</strong> Chill, welcoming energy —
                drama-free, coin-filled.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Coin-Collecting Brotherhood →</strong> Loot, wins, and
                memories hoarded together.
              </Typography>
            </li>
          </Box>
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
          • Pledge your loyalty early to secure your spot in the Cult. <br />
          • Questions? Reach out to us anytime!
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => (window.location.href = "/guild/apply")}
        >
          ✨ Click Here to Apply ✨
        </Button>

        <Typography sx={{ fontWeight: "bold", mt: 2 }}>
          🔗{" "}
          <Link
            href="https://discord.gg/airona"
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

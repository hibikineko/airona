'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
  Alert,
  Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  EmojiEvents, 
  Star, 
  TrendingUp, 
  Collections,
  LocalFireDepartment,
  AutoAwesome,
  ArrowBack
} from '@mui/icons-material';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';
import Image from 'next/image';

const FortuneLeaderboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [leaderboardState, setLeaderboardState] = useState({
    rankings: [],
    userRank: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeaderboard();
    } else if (status === 'unauthenticated') {
      setLeaderboardState(prev => ({ ...prev, loading: false }));
    }
  }, [status]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/fortune/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboardState({
        rankings: data.rankings || [],
        userRank: data.userRank || null,
        loading: false,
        error: null
      });
    } catch (error) {
      setLeaderboardState({
        rankings: [],
        userRank: null,
        loading: false,
        error: 'Failed to load leaderboard'
      });
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <EmojiEvents sx={{ color: '#FFD700', fontSize: { xs: 24, sm: 32 } }} />;
      case 2: return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: { xs: 24, sm: 32 } }} />;
      case 3: return <EmojiEvents sx={{ color: '#CD7F32', fontSize: { xs: 24, sm: 32 } }} />;
      default: return <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>#{rank}</Typography>;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 2: return 'linear-gradient(135deg, #C0C0C0, #A0A0A0)';
      case 3: return 'linear-gradient(135deg, #CD7F32, #8B4513)';
      default: return 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))';
    }
  };

  if (status === 'loading' || leaderboardState.loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            🏆 Fortune Leaderboard
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 1, sm: 0 }
            }}
          >
            See who has the best Fortune Card collections!
          </Typography>
          
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            maxWidth: { xs: '100%', sm: 500 }, 
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(114, 47, 204, 0.1), rgba(33, 203, 243, 0.1))'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
              >
                🎮 Join the Competition!
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Sign in with Discord to see your ranking and compete with other players!
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => signIn('discord')}
              startIcon={<FaDiscord />}
              sx={{
                py: { xs: 1.5, sm: 2 },
                px: { xs: 3, sm: 4 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                width: { xs: '100%', sm: 'auto' },
                background: '#5865F2',
                '&:hover': {
                  background: '#4752C4',
                }
              }}
            >
              Sign in with Discord
            </Button>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Free to play • No spam • Secure authentication
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ 
              position: 'absolute', 
              left: { xs: 16, sm: 0 },
              fontSize: { xs: '0.8rem', sm: '0.9rem' }
            }}
          >
            Back
          </Button>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            🏆 Fortune Leaderboard
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Top Fortune Card collectors
        </Typography>
      </Box>

      {/* Error Display */}
      {leaderboardState.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {leaderboardState.error}
        </Alert>
      )}

      {/* User's Rank Card */}
      {leaderboardState.userRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: { xs: 2, sm: 4 },
            background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.2), rgba(255, 149, 0, 0.2))',
            border: '2px solid rgba(175, 82, 222, 0.3)'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Your Ranking
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getRankIcon(leaderboardState.userRank.rank)}
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {leaderboardState.userRank.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rank #{leaderboardState.userRank.rank}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="h5" color="primary" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                    {leaderboardState.userRank.completion_rate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection Complete
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(175, 82, 222, 0.1)' }}>
                <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Rank
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Player
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Collection %
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Cards
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Streak
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Draws
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardState.rankings.map((player, index) => (
                <motion.tr
                  key={player.user_id}
                  component={TableRow}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  sx={{
                    background: getRankColor(player.rank),
                    '&:hover': {
                      backgroundColor: 'rgba(175, 82, 222, 0.1)',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRankIcon(player.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={player.avatar || '/airona/airona1.png'} 
                        sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                      />
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight="medium"
                          sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
                        >
                          {player.username}
                        </Typography>
                        {player.rank <= 3 && (
                          <Chip 
                            label={player.rank === 1 ? "Champion" : player.rank === 2 ? "Master" : "Expert"}
                            size="small"
                            color={player.rank === 1 ? "warning" : player.rank === 2 ? "default" : "secondary"}
                            sx={{ fontSize: '0.6rem', height: 16 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Typography 
                        variant="h6" 
                        color="primary"
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        {player.completion_rate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(player.completion_rate)}
                        sx={{ 
                          height: 4, 
                          borderRadius: 2, 
                          mt: 0.5,
                          backgroundColor: 'rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {player.cards_collected}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <LocalFireDepartment 
                        sx={{ 
                          fontSize: { xs: 16, sm: 20 }, 
                          color: player.daily_streak > 0 ? '#ff9500' : 'text.secondary' 
                        }} 
                      />
                      <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {player.daily_streak}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {player.total_draws}
                    </Typography>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1))' }}>
              <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                <EmojiEvents sx={{ fontSize: { xs: 32, sm: 40 }, color: '#FFD700', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {leaderboardState.rankings.length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Total Players
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(175,82,222,0.1), rgba(255,149,0,0.1))' }}>
              <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                <Collections sx={{ fontSize: { xs: 32, sm: 40 }, color: '#af52de', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {leaderboardState.rankings.length > 0 ? Math.round(leaderboardState.rankings.reduce((sum, p) => sum + parseFloat(p.completion_rate), 0) / leaderboardState.rankings.length) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Avg Collection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,149,0,0.1), rgba(255,69,0,0.1))' }}>
              <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                <LocalFireDepartment sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ff9500', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {leaderboardState.rankings.length > 0 ? Math.max(...leaderboardState.rankings.map(p => p.daily_streak)) : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Highest Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(33,203,243,0.1))' }}>
              <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                <TrendingUp sx={{ fontSize: { xs: 32, sm: 40 }, color: '#00d4ff', mb: 1 }} />
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {leaderboardState.rankings.length > 0 ? leaderboardState.rankings.reduce((sum, p) => sum + p.total_draws, 0) : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Total Draws
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default FortuneLeaderboard;
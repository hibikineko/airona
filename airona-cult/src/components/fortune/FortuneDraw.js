'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Casino, Schedule, Star, AutoAwesome } from '@mui/icons-material';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';
import Image from 'next/image';
import FortuneCard from '@/components/fortune/FortuneCard';
import BannerSelector from '@/components/fortune/BannerSelector';
import CoinBalance from '@/components/fortune/CoinBalance';
import PityCounter from '@/components/fortune/PityCounter';

const FortuneDraw = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [gameState, setGameState] = useState({
    canDraw: false,
    isDrawing: false,
    drawnCard: null,
    stats: null,
    loading: true,
    error: null,
    showingTodaysCard: false
  });

  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isActive: false
  });

  // Enhanced state for new features
  const [selectedBanner, setSelectedBanner] = useState('standard');
  const [coinBalance, setCoinBalance] = useState(0);
  const [drawType, setDrawType] = useState('free'); // 'free' or 'coin'
  
  // Ref for CoinBalance component
  const coinBalanceRef = useRef();
  
  // Ref for PityCounter component  
  const pityCounterRef = useRef();

  // Fetch user stats and game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch('/api/fortune/stats');
      if (!response.ok) throw new Error('Failed to fetch game state');
      
      const data = await response.json();
      setGameState(prev => ({
        ...prev,
        stats: data.stats,
        canDraw: data.gameState?.canDrawToday || false,
        nextDrawTime: data.gameState?.nextDrawAvailable,
        isOwner: data.gameState?.isOwner || false,
        loading: false
      }));

      // Check if there's already a card drawn today
      if (data.gameState?.hasDrawnToday && !data.gameState?.canDrawToday) {
        fetchTodaysCard();
      }
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: 'Failed to load game state',
        loading: false
      }));
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGameState();
    } else if (status === 'unauthenticated') {
      // Stop loading for unauthenticated users
      setGameState(prev => ({ ...prev, loading: false }));
    }
  }, [status, fetchGameState]);

  // Countdown timer logic
  const startCountdown = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0); // Next midnight UTC
    
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = tomorrow.getTime() - now.getTime();
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setCountdown({
          hours,
          minutes,
          seconds,
          isActive: true
        });
      } else {
        setCountdown({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isActive: false
        });
        // Refresh game state when countdown ends - just trigger a state update
        setGameState(prev => ({ ...prev, canDraw: true }));
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown effect
  useEffect(() => {
    let cleanup;
    if (!gameState.canDraw && !gameState.isOwner && gameState.stats) {
      cleanup = startCountdown();
    }
    return cleanup;
  }, [gameState.canDraw, gameState.isOwner, gameState.stats, startCountdown]);

  const fetchTodaysCard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/fortune/collection?page=0&pageSize=1&today_only=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.userCards && data.userCards.length > 0) {
          const todaysCard = data.userCards.find(uc => uc.drawn_date === today && uc.is_daily_draw);
          if (todaysCard) {
            setGameState(prev => ({
              ...prev,
              drawnCard: todaysCard.cards,
              showingTodaysCard: true
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch today\'s card:', error);
    }
  };

  const handleDraw = async (useCoin = false) => {
    setGameState(prev => ({ ...prev, isDrawing: true, error: null }));
    
    try {
      const response = await fetch('/api/fortune/draw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banner_type: selectedBanner,
          use_coin: useCoin
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Draw failed');
      }
      
      const data = await response.json();
      
      setGameState(prev => ({
        ...prev,
        drawnCard: data.card,
        canDraw: data.canDraw || false,
        isDrawing: false,
        stats: data.updatedStats || prev.stats,
        showingTodaysCard: false
      }));

      // Update coin balance if it was a coin draw
      if (useCoin && data.newBalance !== undefined) {
        setCoinBalance(data.newBalance);
      }
      
      // Always refresh both components to show real-time updates
      // Use setTimeout to ensure the server has processed the transaction
      setTimeout(() => {
        if (coinBalanceRef.current) {
          coinBalanceRef.current.refresh();
        }
        
        if (pityCounterRef.current) {
          pityCounterRef.current.refresh();
        }
      }, 100); // Small delay to ensure server processing is complete
      
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: error.message,
        isDrawing: false
      }));
    }
  };

  const resetCard = () => {
    setGameState(prev => ({
      ...prev,
      drawnCard: null,
      showingTodaysCard: false,
      error: null
    }));
  };

  const goToCollection = () => {
    router.push('/game/fortune/collection');
  };

  if (status === 'loading' || gameState.loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
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
            🔮 Fortune Cards
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
            Draw your daily card and discover Airona&apos;s wisdom!
          </Typography>
          
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            maxWidth: { xs: '100%', sm: 500 }, 
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(114, 47, 204, 0.1), rgba(33, 203, 243, 0.1))'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                🎮 Join the Game!
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Sign in with Discord to start collecting beautiful Fortune Cards and build your collection!
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
    <Container maxWidth="lg" sx={{ 
      py: { xs: 2, sm: 4 },
      px: { xs: 1, sm: 2 }
    }}>
      {/* Header with Airona Blessing */}
      <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            🔮 Airona&apos;s Fortune Blessing
          </Typography>
          
          {/* Airona Mascot */}
          <Box sx={{ mb: { xs: 2, sm: 3 }, position: 'relative', display: 'inline-block' }}>
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/airona/airona_heart.png"
                alt="Airona&apos;s Blessing"
                width={isMobile ? 80 : 120}
                height={isMobile ? 80 : 120}
                style={{ 
                  filter: 'drop-shadow(0 4px 8px rgba(175, 82, 222, 0.3))',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </motion.div>
            
            {/* Sparkle effects */}
            <motion.div
              style={{
                position: 'absolute',
                top: '10%',
                right: '10%',
                fontSize: isMobile ? '16px' : '20px'
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 0.5
              }}
            >
              ✨
            </motion.div>
            
            <motion.div
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '10%',
                fontSize: isMobile ? '14px' : '18px'
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            >
              ⭐
            </motion.div>
          </Box>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontStyle: 'italic',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            {gameState.drawnCard ? 
              `Your today's blessing has been revealed!` :
              gameState.canDraw ? 
                `Receive Airona's divine blessing for today!` :
                `Airona's blessing awaits you tomorrow!`
            }
          </Typography>
        </motion.div>
      </Box>

      {/* Stats Panel */}
      {gameState.stats && (
        <Paper sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 4 }, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          overflow: 'auto'
        }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {gameState.stats.total_draws}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total Draws
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  color="secondary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {gameState.stats.cards_collected}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Cards Collected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#ff9500',
                    fontSize: { xs: '1.5rem', sm: '2.125rem' }
                  }}
                >
                  {gameState.stats.daily_streak}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Daily Streak
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#af52de',
                    fontSize: { xs: '1.5rem', sm: '2.125rem' }
                  }}
                >
                  {gameState.stats.longest_streak}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Best Streak
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Persistent Countdown Display */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        mb: { xs: 2, sm: 3 },
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))',
        border: '1px solid rgba(175, 82, 222, 0.2)'
      }}>
        {countdown.isActive ? (
          <Box>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                mb: 0.5
              }}
            >
              ⏰ Next blessing available in:
            </Typography>
            <Typography 
              variant="h6" 
              color="secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
            >
              {countdown.hours.toString().padStart(2, '0')}:
              {countdown.minutes.toString().padStart(2, '0')}:
              {countdown.seconds.toString().padStart(2, '0')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                mb: 0.5
              }}
            >
              {gameState.canDraw ? "🌟 Your blessing awaits!" : "🕐 Next blessing available at:"}
            </Typography>
            {!gameState.canDraw && gameState.nextDrawTime && (
              <Typography 
                variant="body1" 
                color="secondary"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 'medium'
                }}
              >
                {new Date(gameState.nextDrawTime).toLocaleTimeString()} UTC
              </Typography>
            )}
            {gameState.canDraw && (
              <Typography 
                variant="body1" 
                color="secondary"
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 'medium'
                }}
              >
                Draw your Fortune Card now!
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {/* Error Display */}
      {gameState.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setGameState(prev => ({ ...prev, error: null }))}
        >
          {gameState.error}
        </Alert>
      )}

      {/* Enhanced Fortune Card System UI */}
      {session?.user?.id && (
        <>
          {/* Coin Balance Display */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <CoinBalance 
              ref={coinBalanceRef}
              onBalanceUpdate={setCoinBalance}
              size="large"
              showHistory={true}
            />
          </Box>

          {/* Banner Selection */}
          <BannerSelector
            selectedBanner={selectedBanner}
            onBannerChange={setSelectedBanner}
            disabled={gameState.isDrawing}
          />

          {/* Pity Counter */}
          <PityCounter
            ref={pityCounterRef}
            bannerType={selectedBanner}
            onUpdate={(current, remaining) => {
              // Could add additional pity logic here if needed
            }}
          />
        </>
      )}

      {/* Main Game Area */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        minHeight: { xs: '400px', sm: '500px' },
        px: { xs: 1, sm: 0 }
      }}>
        
        {/* Draw Button or Status */}
        {!gameState.drawnCard && (
          <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4 } }}>
            {gameState.canDraw ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Pre-draw blessing message */}
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  mb: { xs: 2, sm: 3 }, 
                  background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))',
                  border: '1px solid rgba(175, 82, 222, 0.2)',
                  maxWidth: { xs: '100%', sm: 500 },
                  mx: 'auto'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2,
                    textAlign: 'center'
                  }}>
                    <Image
                      src="/airona/airona_wink.png"
                      alt="Airona Wink"
                      width={60}
                      height={60}
                      style={{ 
                        marginRight: isMobile ? 0 : 16, 
                        marginBottom: isMobile ? 8 : 0,
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        gutterBottom
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        Get Airona&apos;s Blessing!
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        &ldquo;I have a special blessing waiting just for you today! ✨&rdquo;
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Draw Buttons - Free and Coin Options */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {/* Free Daily Draw Button */}
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleDraw(false)}
                      disabled={gameState.isDrawing || !gameState.canDraw}
                      startIcon={gameState.isDrawing ? <Schedule /> : <AutoAwesome />}
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        background: 'linear-gradient(45deg, #af52de 30%, #ff9500 90%)',
                        boxShadow: '0 4px 20px rgba(175, 82, 222, 0.4)',
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: 200,
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(175, 82, 222, 0.6)',
                          background: 'linear-gradient(45deg, #9c47cc 30%, #e6890e 90%)',
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        }
                      }}
                    >
                      {gameState.isDrawing ? 'Drawing...' : 
                       gameState.canDraw ? 'Free Daily Draw' : 'Used Today'}
                    </Button>

                    {/* Coin Draw Button */}
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handleDraw(true)}
                      disabled={gameState.isDrawing || coinBalance < 1}
                      startIcon={
                        <Image
                          src="/airona/airona_coin.png"
                          alt="Airona Coin"
                          width={20}
                          height={20}
                          style={{ objectFit: 'contain' }}
                        />
                      }
                      sx={{
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: 200,
                        '&:hover': {
                          borderColor: '#FFA500',
                          backgroundColor: 'rgba(255, 215, 0, 0.1)',
                          color: '#FFA500'
                        },
                        '&:disabled': {
                          borderColor: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.26)'
                        }
                      }}
                    >
                      Draw with 1 Coin
                    </Button>
                  </Box>

                  {/* Helper Text */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                    {coinBalance >= 1 && (
                      <Image
                        src="/airona/airona_coin.png"
                        alt="Airona Coin"
                        width={16}
                        height={16}
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        textAlign: 'center',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}
                    >
                      {coinBalance < 1 && !gameState.canDraw ? 
                        'No coins available. Come back tomorrow for free draw!' :
                        coinBalance < 1 ? 
                          'Use your free draw or earn coins by dismantling duplicate cards' :
                          `You have ${coinBalance} coin${coinBalance !== 1 ? 's' : ''} available`
                      }
                    </Typography>
                  </Box>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Paper sx={{ 
                  p: { xs: 2, sm: 4 }, 
                  textAlign: 'center', 
                  maxWidth: { xs: '100%', sm: 500 }, 
                  mx: 'auto',
                  background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))',
                  border: '1px solid rgba(175, 82, 222, 0.2)'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Image
                      src={gameState.isOwner ? "/airona/airona_gojo.png" : "/airona/airona_unconcious.png"}
                      alt="Airona Resting"
                      width={80}
                      height={80}
                      style={{ 
                        filter: 'drop-shadow(0 2px 4px rgba(175, 82, 222, 0.3))',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    color="primary"
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    {gameState.isOwner ? '👑 Divine Testing Mode' : '🌙 Blessing Recharging'}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.primary" 
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      px: { xs: 1, sm: 0 }
                    }}
                  >
                    {gameState.isOwner ? 
                      '"You have divine powers! Draw as many blessings as you wish for testing!"' :
                      '"I\'m gathering cosmic energy for your next daily blessing... But you can still use coins!"'
                    }
                  </Typography>
                  
                  <Chip 
                    label={gameState.isOwner ? "🧪 Testing Enabled" : "⏳ Daily Resets at Midnight UTC"}
                    color={gameState.isOwner ? "success" : "warning"}
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      px: { xs: 1.5, sm: 2 },
                      py: 1,
                      mb: 2
                    }}
                  />

                  {/* Coin Draw Option for Daily Exhausted Users */}
                  {!gameState.isOwner && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => handleDraw(true)}
                        disabled={gameState.isDrawing || coinBalance < 1}
                        startIcon={
                          <Image
                            src="/airona/airona_coin.png"
                            alt="Airona Coin"
                            width={20}
                            height={20}
                            style={{ objectFit: 'contain' }}
                          />
                        }
                        sx={{
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 3, sm: 4 },
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          borderColor: '#FFD700',
                          color: '#000',
                          backgroundColor: '#FFD700',
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: 200,
                          mb: 1,
                          '&:hover': {
                            borderColor: '#FFA500',
                            backgroundColor: '#FFA500',
                            color: '#000'
                          },
                          '&:disabled': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)'
                          }
                        }}
                      >
                        {gameState.isDrawing ? 'Drawing...' : 'Draw with 1 Coin'}
                      </Button>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                        {coinBalance >= 1 && (
                          <Image
                            src="/airona/airona_coin.png"
                            alt="Airona Coin"
                            width={14}
                            height={14}
                            style={{ objectFit: 'contain' }}
                          />
                        )}
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            textAlign: 'center',
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          {coinBalance < 1 ? 
                            'No coins available. Dismantle duplicate cards to earn coins!' :
                            `You have ${coinBalance} coin${coinBalance !== 1 ? 's' : ''} available for more draws`
                          }
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Navigation buttons for when blessing is recharging */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    mt: 2
                  }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/game/fortune/collection')}
                      sx={{
                        borderColor: 'rgba(175, 82, 222, 0.5)',
                        color: '#af52de',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        px: { xs: 2, sm: 3 },
                        '&:hover': {
                          borderColor: '#af52de',
                          backgroundColor: 'rgba(175, 82, 222, 0.1)'
                        }
                      }}
                    >
                      ✨ View Collection
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/game/fortune/leaderboard')}
                      sx={{
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        color: '#000',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        px: { xs: 2, sm: 3 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                        }
                      }}
                    >
                      🏆 Leaderboard
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </Box>
        )}

        {/* Card Display Area with Blessing Message */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: { xs: 350, sm: 500 },
          position: 'relative',
          width: '100%',
          px: { xs: 1, sm: 0 }
        }}>
          <AnimatePresence mode="wait">
            {gameState.isDrawing && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h5" 
                    color="primary" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                  >
                    ✨ Channeling Divine Energy ✨
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      px: { xs: 2, sm: 0 }
                    }}
                  >
                    Airona is selecting your perfect blessing...
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <FortuneCard 
                    card={null}
                    isRevealed={false}
                    size="large"
                  />
                </Box>
              </motion.div>
            )}
            
            {gameState.drawnCard && !gameState.isDrawing && (
              <motion.div
                key="drawn-card"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 2,
                      textAlign: 'center'
                    }}>
                      <Image
                        src="/airona/airona_yay.png"
                        alt="Airona Celebration"
                        width={60}
                        height={60}
                        style={{ 
                          marginRight: isMobile ? 0 : 16,
                          marginBottom: isMobile ? 8 : 0,
                          maxWidth: '100%',
                          height: 'auto'
                        }}
                      />
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                          variant="h5" 
                          color="primary" 
                          gutterBottom
                          sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                        >
                          {gameState.showingTodaysCard ? "🌟 Today's Divine Blessing! 🌟" : "🎉 Your Divine Blessing! 🎉"}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ 
                            fontStyle: 'italic',
                            fontSize: { xs: '0.85rem', sm: '1rem' },
                            px: { xs: 1, sm: 0 }
                          }}
                        >
                          {gameState.showingTodaysCard 
                            ? "Here's the blessing you received today!" 
                            : "This blessing is specially chosen for you today!"
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <FortuneCard 
                    card={gameState.drawnCard}
                    isRevealed={true}
                    size="large"
                    showFullDetails={true}
                  />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Card Actions */}
        {gameState.drawnCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{ 
              marginTop: isMobile ? 16 : 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              gap: isMobile ? 12 : 16
            }}
          >
            {/* Draw Again Options */}
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))',
              border: '1px solid rgba(175, 82, 222, 0.2)',
              maxWidth: 600,
              width: '100%'
            }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                🎲 Draw Another Card?
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}>
                {/* Free Daily Draw Button */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleDraw(false)}
                  disabled={gameState.isDrawing || !gameState.canDraw}
                  startIcon={gameState.isDrawing ? <Schedule /> : <AutoAwesome />}
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    background: gameState.canDraw 
                      ? 'linear-gradient(45deg, #af52de 30%, #ff9500 90%)'
                      : 'rgba(0, 0, 0, 0.12)',
                    boxShadow: gameState.canDraw ? '0 4px 20px rgba(175, 82, 222, 0.4)' : 'none',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: 200,
                    '&:hover': gameState.canDraw ? {
                      boxShadow: '0 6px 25px rgba(175, 82, 222, 0.6)',
                      background: 'linear-gradient(45deg, #9c47cc 30%, #e6890e 90%)',
                    } : {},
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  {gameState.isDrawing ? 'Drawing...' : 
                   gameState.canDraw ? 'Free Daily Draw' : '🌙 Blessing Recharging'}
                </Button>

                {/* Coin Draw Button */}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleDraw(true)}
                  disabled={gameState.isDrawing || coinBalance < 1}
                  startIcon={
                    <Image
                      src="/airona/airona_coin.png"
                      alt="Airona Coin"
                      width={20}
                      height={20}
                      style={{ objectFit: 'contain' }}
                    />
                  }
                  sx={{
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 3, sm: 4 },
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    borderColor: '#FFD700',
                    color: '#000',
                    backgroundColor: '#FFD700',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: 200,
                    '&:hover': {
                      borderColor: '#FFA500',
                      backgroundColor: '#FFA500',
                      color: '#000'
                    },
                    '&:disabled': {
                      borderColor: 'rgba(0, 0, 0, 0.12)',
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  Draw with 1 Coin
                </Button>
              </Box>

              {/* Helper Text */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {!gameState.canDraw && coinBalance < 1 ? 
                  'Daily blessing used. Get coins by dismantling duplicate cards!' :
                  !gameState.canDraw ? 
                    `Daily blessing used. You have ${coinBalance} coin${coinBalance !== 1 ? 's' : ''} available` :
                  coinBalance < 1 ? 
                    'Use your free draw or earn coins for more draws' :
                    `Free draw available or use ${coinBalance} coin${coinBalance !== 1 ? 's' : ''}`
                }
              </Typography>
            </Paper>

            {/* Navigation buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="outlined"
                onClick={goToCollection}
                sx={{
                  borderColor: 'rgba(175, 82, 222, 0.5)',
                  color: '#af52de',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    borderColor: '#af52de',
                    backgroundColor: 'rgba(175, 82, 222, 0.1)'
                  }
                }}
              >
                ✨ View Collection
              </Button>
              <Button
                variant="outlined"
                onClick={resetCard}
                sx={{
                  borderColor: 'rgba(33, 150, 243, 0.5)',
                  color: '#2196f3',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)'
                  }
                }}
              >
                🎲 Draw Again
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/game/fortune/leaderboard')}
                sx={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  px: { xs: 2, sm: 3 },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
                  }
                }}
              >
                🏆 Leaderboard
              </Button>
            </Box>
          </motion.div>
        )}
      </Box>
    </Container>
  );
};

export default FortuneDraw;
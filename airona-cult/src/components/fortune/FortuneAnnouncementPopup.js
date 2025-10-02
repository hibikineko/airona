'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close, Casino, Star, AutoAwesome } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const FortuneAnnouncementPopup = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen the announcement today
    const lastSeen = localStorage.getItem('fortune-announcement-seen');
    const today = new Date().toDateString();
    
    if (lastSeen !== today) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Mark as seen for today
    const today = new Date().toDateString();
    localStorage.setItem('fortune-announcement-seen', today);
    setOpen(false);
  };

  const handleGoToDraw = () => {
    handleClose();
    router.push('/game/fortune/draw');
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(175, 82, 222, 0.1), rgba(255, 149, 0, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'rgba(175, 82, 222, 0.3)'
            }
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)'
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Close Button */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
              <IconButton 
                onClick={handleClose}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
              {/* Floating Stars Animation */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: [20, -10, 20],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                      ease: 'easeInOut'
                    }}
                    style={{
                      position: 'absolute',
                      left: `${20 + index * 12}%`,
                      top: `${index % 2 === 0 ? '10%' : '70%'}`
                    }}
                  >
                    <Star sx={{ color: '#FFD700', fontSize: { xs: 16, sm: 20 } }} />
                  </motion.div>
                ))}
              </Box>

              {/* Main Airona Image */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box sx={{ 
                  width: { xs: 120, sm: 150 }, 
                  height: { xs: 120, sm: 150 },
                  mx: 'auto',
                  mb: 3,
                  position: 'relative',
                  filter: 'drop-shadow(0 8px 16px rgba(175, 82, 222, 0.3))'
                }}>
                  <Image
                    src="/airona/airona_yay.png"
                    alt="Airona celebrating"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #af52de, #ff9500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  ✨ Airona&apos;s Fortune Blessing ✨
                </Typography>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2,
                    color: 'text.primary',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  is now LIVE! 🎉
                </Typography>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3,
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Draw mystical fortune cards blessed by Airona herself! 
                  Discover your daily fortune, collect beautiful cards, and 
                  experience the magic of Airona&apos;s guidance.
                </Typography>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: { xs: 2, sm: 4 }, 
                  mb: 4,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AutoAwesome sx={{ color: '#af52de', fontSize: 32, mb: 1 }} />
                    <Typography variant="caption" display="block">
                      Daily Blessings
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Casino sx={{ color: '#ff9500', fontSize: 32, mb: 1 }} />
                    <Typography variant="caption" display="block">
                      Fortune Cards
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Image 
                        src="/airona/airona_coin.png" 
                        alt="Airona Coin" 
                        width={32} 
                        height={32} 
                      />
                    </Box>
                    <Typography variant="caption" display="block">
                      Airona Coins
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                style={{ flex: 1 }}
              >
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  fullWidth={isMobile}
                  sx={{ 
                    borderColor: 'rgba(175, 82, 222, 0.5)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: '#af52de',
                      backgroundColor: 'rgba(175, 82, 222, 0.1)'
                    }
                  }}
                >
                  Maybe Later
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                style={{ flex: 1 }}
              >
                <Button
                  onClick={handleGoToDraw}
                  variant="contained"
                  fullWidth={isMobile}
                  startIcon={<Star />}
                  sx={{
                    background: 'linear-gradient(45deg, #af52de, #ff9500)',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #9d47d1, #e6850a)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(175, 82, 222, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Let&apos;s Go! ✨
                </Button>
              </motion.div>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default FortuneAnnouncementPopup;
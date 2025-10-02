import React from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Star, Favorite } from '@mui/icons-material';
import Image from 'next/image';

const FortuneCard = ({ 
  card, 
  isRevealed = true, 
  onReveal, 
  showFullDetails = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const theme = useTheme();
  
  // Size configurations
  const sizes = {
    small: { width: 180, height: 250, imageSize: 80 },
    medium: { width: 240, height: 320, imageSize: 120 },
    large: { width: 300, height: 400, imageSize: 160 }
  };
  
  const currentSize = sizes[size];
  
  // Rarity configurations
  const rarityConfig = {
    elite: {
      color: '#af52de',
      label: 'Elite',
      stars: 3,
      glow: 'rgba(175, 82, 222, 0.5)'
    },
    super_rare: {
      color: '#ff9500',
      label: 'Super Rare',
      stars: 4,
      glow: 'rgba(255, 149, 0, 0.6)'
    },
    ultra_rare: {
      color: '#00d4ff',
      label: 'Ultra Rare',
      stars: 5,
      glow: 'rgba(0, 212, 255, 0.8)',
      rainbow: true
    }
  };
  
  const rarity = rarityConfig[card?.rarity] || rarityConfig.elite;
  
  // Card background gradient
  const getCardBackground = () => {
    if (!isRevealed) {
      return `linear-gradient(135deg, 
        ${theme.palette.primary.main}20, 
        ${theme.palette.secondary.main}20
      )`;
    }
    
    const baseColor = card?.background_color || rarity.color;
    
    if (rarity.rainbow) {
      // Ultra rare rainbow effect
      return `linear-gradient(45deg, 
        #ff0080 0%, 
        #ff8c00 14%, 
        #40e0d0 28%, 
        #9370db 42%, 
        #00ff00 57%, 
        #0080ff 71%, 
        #ff0080 85%, 
        #ff8c00 100%
      )`;
    }
    
    return `linear-gradient(135deg, 
      ${baseColor}15, 
      ${baseColor}30, 
      ${baseColor}15
    )`;
  };
  
  // Render stars for rarity
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        sx={{
          fontSize: 16,
          color: i < rarity.stars ? rarity.color : theme.palette.grey[400],
          filter: i < rarity.stars ? `drop-shadow(0 0 3px ${rarity.glow})` : 'none'
        }}
      />
    ));
  };
  
  // Card flip animation variants
  const cardVariants = {
    hidden: {
      rotateY: 180,
      scale: 0.8,
    },
    visible: {
      rotateY: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };
  
  // Glow animation for rare cards
  const glowVariants = {
    animate: {
      boxShadow: rarity.rainbow ? [
        `0 0 20px rgba(255, 0, 128, 0.6), 0 0 40px rgba(0, 212, 255, 0.4)`,
        `0 0 40px rgba(0, 212, 255, 0.8), 0 0 60px rgba(255, 149, 0, 0.6)`,
        `0 0 20px rgba(255, 0, 128, 0.6), 0 0 40px rgba(0, 212, 255, 0.4)`
      ] : [
        `0 0 20px ${rarity.glow}`,
        `0 0 40px ${rarity.glow}`,
        `0 0 20px ${rarity.glow}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial={!isRevealed ? "hidden" : "visible"}
      animate={isRevealed ? "visible" : "hidden"}
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.2 } 
      }}
      style={{ 
        perspective: 1000,
        width: currentSize.width,
        height: currentSize.height
      }}
    >
      <motion.div
        variants={glowVariants}
        animate={isRevealed && (card?.rarity === 'elite' || card?.rarity === 'super_rare' || card?.rarity === 'ultra_rare') ? "animate" : ""}
      >
        <Card
          onClick={!isRevealed ? onReveal : undefined}
          sx={{
            width: currentSize.width,
            height: currentSize.height,
            cursor: !isRevealed ? 'pointer' : 'default',
            background: getCardBackground(),
            border: rarity.rainbow ? 
              `3px solid transparent` : 
              `2px solid ${rarity.color}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: rarity.rainbow ? 
              `linear-gradient(white, white), linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0, #9370db, #00ff00, #0080ff, #ff0080)` :
              'none',
            backgroundOrigin: rarity.rainbow ? 'border-box' : 'initial',
            backgroundClip: rarity.rainbow ? 'content-box, border-box' : 'initial',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, transparent 30%, ${rarity.glow} 50%, transparent 70%)`,
              opacity: isRevealed ? 0.1 : 0,
              transition: 'opacity 0.3s ease'
            },
            '&:hover::before': {
              opacity: isRevealed ? 0.2 : 0
            }
          }}
        >
          {/* Card Back */}
          {!isRevealed && (
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              background: `linear-gradient(135deg, 
                ${theme.palette.primary.main}30, 
                ${theme.palette.secondary.main}30
              )`
            }}>
              <Box sx={{ 
                width: currentSize.imageSize, 
                height: currentSize.imageSize,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography variant="h3" sx={{ color: 'white', opacity: 0.7 }}>
                  ?
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                Tap to reveal
              </Typography>
            </CardContent>
          )}

          {/* Card Front */}
          {isRevealed && card && (
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              p: 2
            }}>
              {/* Rarity Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1
              }}>
                <Chip
                  label={rarity.label}
                  size="small"
                  sx={{
                    backgroundColor: rarity.color,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                />
                <Box sx={{ display: 'flex' }}>
                  {renderStars()}
                </Box>
              </Box>

              {/* Airona Sticker */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2,
                flex: '0 0 auto'
              }}>
                <Box sx={{ 
                  width: currentSize.imageSize, 
                  height: currentSize.imageSize,
                  position: 'relative',
                  filter: `drop-shadow(0 4px 8px ${rarity.glow})`
                }}>
                  <Image
                    src={`/airona/${card.airona_sticker_path}`}
                    alt={card.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Box>

              {/* Card Name */}
              <Typography 
                variant={size === 'large' ? 'h6' : 'subtitle1'} 
                component="h3"
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: rarity.color,
                  mb: 1,
                  textShadow: `0 2px 4px ${rarity.glow}`
                }}
              >
                {card.name}
              </Typography>

              {/* Card Description */}
              {showFullDetails && (
                <>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textAlign: 'center',
                      color: theme.palette.text.secondary,
                      mb: 2,
                      flex: 1,
                      fontSize: size === 'small' ? '0.75rem' : undefined
                    }}
                  >
                    {card.description}
                  </Typography>

                  {/* Fortune Message */}
                  <Box sx={{ 
                    mt: 'auto',
                    p: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    border: `1px solid ${rarity.color}30`
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic',
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        fontSize: size === 'small' ? '0.7rem' : undefined
                      }}
                    >
                      "{card.fortune_message}"
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FortuneCard;
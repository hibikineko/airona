'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Chip,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  MonetizationOn,
  Warning,
  Delete,
  CheckCircle,
  Info
} from '@mui/icons-material';
import Image from 'next/image';

const CardDismantler = ({ open, onClose, userCards, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedCards, setSelectedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const rarityColors = {
    ultra_rare: '#FFD700',
    super_rare: '#9932CC',
    elite: '#32CD32'
  };

  const dismantlingRules = {
    ultra_rare: { required: 1, coins: 1 },
    super_rare: { required: 3, coins: 1 },
    elite: { required: 5, coins: 1 }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedCards([]);
      setError('');
      setPreviewData(null);
    }
  }, [open]);

  // Filter cards that can be dismantled (quantity > 1)
  const dismantlableCards = userCards.filter(userCard => 
    userCard.quantity > 1
  );

  const handleCardToggle = (cardId) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
    setError('');
  };

  const calculatePreview = () => {
    if (selectedCards.length === 0) {
      setPreviewData(null);
      return;
    }

    const preview = [];
    let totalCoins = 0;

    selectedCards.forEach(cardId => {
      const userCard = userCards.find(uc => uc.card_id === cardId);
      if (!userCard) return;

      const card = userCard.cards;
      const rules = dismantlingRules[card.rarity];
      
      if (!rules) return;

      const availableForDismantling = userCard.quantity - 1; // Keep at least 1
      const setsToDismantle = Math.floor(availableForDismantling / rules.required);
      
      if (setsToDismantle > 0) {
        const cardsToRemove = setsToDismantle * rules.required;
        const coinsToEarn = setsToDismantle * rules.coins;

        preview.push({
          cardId,
          cardName: card.name,
          rarity: card.rarity,
          currentQuantity: userCard.quantity,
          cardsToRemove,
          newQuantity: userCard.quantity - cardsToRemove,
          coinsEarned: coinsToEarn,
          setsToDismantle
        });

        totalCoins += coinsToEarn;
      }
    });

    setPreviewData({
      items: preview,
      totalCoins
    });
  };

  useEffect(() => {
    calculatePreview();
  }, [selectedCards, userCards]);

  const handleDismantle = async () => {
    if (selectedCards.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fortune/dismantle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardIds: selectedCards
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dismantle cards');
      }

      // Success
      if (onSuccess) {
        onSuccess(data);
      }
      onClose();

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MonetizationOn sx={{ color: 'warning.main' }} />
        Card Dismantling - Earn Airona Coins
      </DialogTitle>

      <DialogContent>
        {/* Dismantling Rules */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dismantling Rules:
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">• Ultra Rare: 1 card = 1 coin</Typography>
            <Typography variant="body2">• Super Rare: 3 cards = 1 coin</Typography>
            <Typography variant="body2">• Elite: 5 cards = 1 coin</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              ⚠️ Must keep at least 1 copy of each card!
            </Typography>
          </Stack>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* No Dismantlable Cards */}
        {dismantlableCards.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Cards Available for Dismantling
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You need duplicate cards to dismantle. Draw more cards to get duplicates!
            </Typography>
          </Box>
        ) : (
          <>
            {/* Card Selection */}
            <Typography variant="h6" gutterBottom>
              Select Cards to Dismantle:
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {dismantlableCards.map((userCard) => {
                const card = userCard.cards;
                const isSelected = selectedCards.includes(card.id);
                const rules = dismantlingRules[card.rarity];
                const availableForDismantling = userCard.quantity - 1;
                const canDismantle = availableForDismantling >= rules.required;

                return (
                  <Grid item xs={12} sm={6} md={4} key={card.id}>
                    <Card 
                      sx={{ 
                        cursor: canDismantle ? 'pointer' : 'not-allowed',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected 
                          ? theme.palette.primary.main 
                          : canDismantle ? 'transparent' : 'rgba(0,0,0,0.12)',
                        opacity: canDismantle ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                      onClick={() => canDismantle && handleCardToggle(card.id)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 100,
                            position: 'relative',
                            backgroundColor: card.background_color || rarityColors[card.rarity] + '20'
                          }}
                        >
                          <Image
                            src={card.airona_sticker_path}
                            alt={card.name}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </CardMedia>
                        
                        {canDismantle && (
                          <Checkbox
                            checked={isSelected}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255,255,255,0.8)'
                            }}
                          />
                        )}
                        
                        <Chip
                          label={`x${userCard.quantity}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            backgroundColor: rarityColors[card.rarity],
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>

                      <CardContent sx={{ pt: 1, pb: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {card.name}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {canDismantle 
                            ? `Can dismantle: ${Math.floor(availableForDismantling / rules.required)} set${Math.floor(availableForDismantling / rules.required) !== 1 ? 's' : ''}`
                            : `Need ${rules.required - availableForDismantling} more`
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Preview Section */}
            {previewData && previewData.items.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Dismantling Preview:
                </Typography>
                
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {previewData.items.map((item) => (
                    <Box
                      key={item.cardId}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {item.cardName}
                        </Typography>
                        <Chip
                          label={`+${item.coinsEarned} coin${item.coinsEarned !== 1 ? 's' : ''}`}
                          color="warning"
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Remove {item.cardsToRemove} copies ({item.currentQuantity} → {item.newQuantity})
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'warning.main', 
                    color: 'warning.contrastText',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6">
                    Total: +{previewData.totalCoins} Airona Coin{previewData.totalCoins !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {dismantlableCards.length > 0 && (
          <Button
            variant="contained"
            onClick={handleDismantle}
            disabled={loading || selectedCards.length === 0 || !previewData}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            color="warning"
          >
            {loading ? 'Dismantling...' : 'Dismantle Selected'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CardDismantler;
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Grid,
  Chip,
  TextField,
  Stack,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Search,
  FilterList,
  ArrowBack,
  Star,
  AutoAwesome,
  EmojiEvents,
  Visibility,
  Close,
  TrendingUp,
  Info
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CardArchive = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rarity: 'all',
    search: '',
    sort: 'rarity'
  });
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const rarityColors = {
    ultra_rare: '#FFD700',
    super_rare: '#9932CC',
    elite: '#32CD32'
  };

  const rarityLabels = {
    ultra_rare: 'Ultra Rare',
    super_rare: 'Super Rare',
    elite: 'Elite'
  };

  // Fetch archive data
  const fetchArchive = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.rarity !== 'all') params.append('rarity', filters.rarity);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await fetch(`/api/fortune/archive?${params}`);
      if (!response.ok) throw new Error('Failed to fetch archive');

      const data = await response.json();
      setCards(data.cards || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching archive:', error);
      setError('Failed to load card archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchArchive();
    }
  }, [session?.user?.id, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCardClick = (card) => {
    if (dismantleMode) {
      handleCardSelection(card);
    } else {
      setSelectedCard(card);
      setDetailOpen(true);
    }
  };

  const handleCardSelection = (card) => {
    if (card.user_quantity <= 1) return; // Can't select cards with only 1 copy
    
    const cardId = card.card_id.toString();
    const maxSelectable = card.user_quantity - 1; // Keep at least 1 copy
    const currentSelected = selectedCards[cardId] || 0;
    
    // Cycle through selection: 0 -> 1 -> 2 -> ... -> max -> 0
    let newSelected;
    if (currentSelected >= maxSelectable) {
      newSelected = 0; // Reset to 0 if at max
    } else {
      newSelected = currentSelected + 1; // Increment selection
    }
    
    setSelectedCards(prev => ({
      ...prev,
      [cardId]: newSelected
    }));
  };

  const handleDismantleMode = () => {
    setDismantleMode(!dismantleMode);
    setSelectedCards({});
  };

  const handleDismantle = async () => {
    const validation = getDismantleValidation();
    if (!validation.isValid) return;

    try {
      setDismantling(true);
      
      // Convert selectedCards object to API format
      const dismantleData = Object.entries(selectedCards)
        .filter(([cardId, quantity]) => quantity > 0)
        .map(([cardId, quantity]) => ({
          cardId: parseInt(cardId),
          quantity
        }));

      const response = await fetch('/api/fortune/dismantle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dismantleData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Dismantling failed');
      }

      const result = await response.json();
      
      // Reset state and refresh data
      setDismantleMode(false);
      setSelectedCards({});
      await fetchArchive();
      
      // Show success message (you might want to add a toast notification here)
      alert(`Successfully dismantled cards and received ${result.coinsEarned} Airona Coin${result.coinsEarned > 1 ? 's' : ''}!`);
      
    } catch (error) {
      console.error('Dismantling error:', error);
      alert('Failed to dismantle cards: ' + error.message);
    } finally {
      setDismantling(false);
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'ultra_rare':
        return <EmojiEvents sx={{ color: rarityColors[rarity] }} />;
      case 'super_rare':
        return <AutoAwesome sx={{ color: rarityColors[rarity] }} />;
      case 'elite':
        return <Star sx={{ color: rarityColors[rarity] }} />;
      default:
        return <Star />;
    }
  };

  if (!session?.user?.id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Sign in to view the Card Archive
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover all available Fortune Cards and track your collection progress!
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => router.push('/game/fortune/collection')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            📚 Card Archive
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Complete database of all Fortune Cards with community statistics
        </Typography>
      </Box>

      {/* Statistics Panel */}
      {stats && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Collection Progress
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {stats.ownedCards} / {stats.totalCards} cards owned
              </Typography>
              <Typography variant="body2" color="primary">
                {stats.collectionPercentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(stats.collectionPercentage)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: rarityColors.ultra_rare }}>
                  {stats.ownedByRarity.ultra_rare}/{stats.rarityDistribution.ultra_rare}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ultra Rare
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: rarityColors.super_rare }}>
                  {stats.ownedByRarity.super_rare}/{stats.rarityDistribution.super_rare}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Super Rare
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: rarityColors.elite }}>
                  {stats.ownedByRarity.elite}/{stats.rarityDistribution.elite}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Elite
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
          {/* Rarity Filter */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {['all', 'ultra_rare', 'super_rare', 'elite'].map((rarity) => (
              <Chip
                key={rarity}
                label={rarity === 'all' ? 'All Cards' : rarityLabels[rarity]}
                onClick={() => handleFilterChange({ rarity })}
                color={filters.rarity === rarity ? 'primary' : 'default'}
                variant={filters.rarity === rarity ? 'filled' : 'outlined'}
                icon={rarity !== 'all' ? getRarityIcon(rarity) : undefined}
              />
            ))}
          </Stack>

          {/* Search */}
          <TextField
            placeholder="Search cards..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          {/* Sort */}
          <Stack direction="row" spacing={1}>
            {[
              { value: 'rarity', label: 'Rarity' },
              { value: 'name', label: 'Name' },
              { value: 'ownership_percentage', label: 'Popularity' }
            ].map((sortOption) => (
              <Chip
                key={sortOption.value}
                label={sortOption.label}
                onClick={() => handleFilterChange({ sort: sortOption.value })}
                color={filters.sort === sortOption.value ? 'secondary' : 'default'}
                variant={filters.sort === sortOption.value ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Cards Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button onClick={fetchArchive} variant="contained">
            Retry
          </Button>
        </Paper>
      ) : cards.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No cards found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={card.card_id}>
              <Fade in={true}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 2,
                    borderColor: card.user_owns ? rarityColors[card.rarity] + '60' : 'transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  {/* Ownership Badge */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 150,
                        position: 'relative',
                        backgroundColor: card.background_color || rarityColors[card.rarity] + '20'
                      }}
                    >
                      <Image
                        src={card.airona_sticker_path?.startsWith('/') 
                          ? card.airona_sticker_path 
                          : `/airona/${card.airona_sticker_path}`}
                        alt={card.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </CardMedia>
                    
                    <Chip
                      label={card.user_owns ? `✓ x${card.user_quantity}` : '❌ Missing'}
                      size="small"
                      color={card.user_owns ? 'success' : 'error'}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontWeight: 'bold'
                      }}
                    />
                    
                    <Chip
                      label={rarityLabels[card.rarity]}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: rarityColors[card.rarity],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                      {card.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {card.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {card.ownership_percentage}% of players own this
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button size="small" startIcon={<Visibility />}>
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Card Detail Modal */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedCard && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                {getRarityIcon(selectedCard.rarity)}
                <Typography variant="h6">
                  {selectedCard.name}
                </Typography>
                <Chip
                  label={rarityLabels[selectedCard.rarity]}
                  size="small"
                  sx={{
                    backgroundColor: rarityColors[selectedCard.rarity],
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
              <IconButton onClick={() => setDetailOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      position: 'relative',
                      backgroundColor: selectedCard.background_color || rarityColors[selectedCard.rarity] + '20',
                      borderRadius: 2,
                      border: 2,
                      borderColor: rarityColors[selectedCard.rarity] + '60'
                    }}
                  >
                    <Image
                      src={selectedCard.airona_sticker_path?.startsWith('/') 
                        ? selectedCard.airona_sticker_path 
                        : `/airona/${selectedCard.airona_sticker_path}`}
                      alt={selectedCard.name}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCard.description}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Fortune Message
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontStyle: 'italic',
                          color: 'primary.main',
                          p: 2,
                          backgroundColor: 'primary.main',
                          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'primary.main'
                        }}
                      >
                        &ldquo;{selectedCard.fortune_message}&rdquo;
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Collection Status
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Your copies:</Typography>
                          <Chip
                            label={selectedCard.user_owns ? `${selectedCard.user_quantity}` : 'Not owned'}
                            size="small"
                            color={selectedCard.user_owns ? 'success' : 'error'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Community ownership:</Typography>
                          <Typography variant="body2" color="primary">
                            {selectedCard.ownership_percentage}% ({selectedCard.total_owners} players)
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Total copies owned:</Typography>
                          <Typography variant="body2">
                            {selectedCard.total_copies_owned}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>
                Close
              </Button>
              {!selectedCard.user_owns && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setDetailOpen(false);
                    router.push('/game/fortune/draw');
                  }}
                >
                  Try to Get This Card
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CardArchive;
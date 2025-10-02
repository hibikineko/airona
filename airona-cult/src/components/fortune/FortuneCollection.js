import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useTheme,
  useMediaQuery,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Star, 
  EmojiEvents, 
  Delete, 
  SelectAll, 
  DeselectOutlined,
  MonetizationOn,
  Close
} from '@mui/icons-material';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import FortuneCard from '@/components/fortune/FortuneCard';

const FortuneCollection = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collectionState, setCollectionState] = useState({
    userCards: [],
    stats: null,
    loading: true,
    error: null,
    page: 0,
    hasMore: true
  });
  
  const [filters, setFilters] = useState({
    search: '',
    rarity: 'all',
    sortBy: 'newest'
  });

  // Dismantling state
  const [dismantleMode, setDismantleMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [dismantleDialog, setDismantleDialog] = useState(false);
  const [dismantling, setDismantling] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch collection data
  const fetchCollection = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: collectionState.page.toString(),
        pageSize: '20'
      });
      
      const response = await fetch(`/api/fortune/collection?${params}`);
      if (!response.ok) throw new Error('Failed to fetch collection');
      
      const data = await response.json();
      
      setCollectionState(prev => ({
        ...prev,
        userCards: data.userCards,
        stats: data.stats,
        hasMore: data.pagination.hasMore,
        loading: false
      }));
    } catch (error) {
      setCollectionState(prev => ({
        ...prev,
        error: 'Failed to load collection',
        loading: false
      }));
    }
  }, [collectionState.page]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCollection();
    } else if (status === 'unauthenticated') {
      // Stop loading for unauthenticated users
      setCollectionState(prev => ({ ...prev, loading: false }));
    }
  }, [status, fetchCollection]);

  // Filter and sort cards
  const filteredCards = collectionState.userCards.filter(userCard => {
    const card = userCard.cards;
    const matchesSearch = card.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         card.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRarity = filters.rarity === 'all' || card.rarity === filters.rarity;
    
    return matchesSearch && matchesRarity;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.cards.name.localeCompare(b.cards.name);
      case 'rarity':
        const rarityOrder = { ultra_rare: 3, super_rare: 2, elite: 1 };
        return rarityOrder[b.cards.rarity] - rarityOrder[a.cards.rarity];
      case 'oldest':
        return new Date(a.drawn_date) - new Date(b.drawn_date);
      case 'newest':
      default:
        return new Date(b.drawn_date) - new Date(a.drawn_date);
    }
  });

  const handlePageChange = (event, newPage) => {
    setCollectionState(prev => ({ ...prev, page: newPage - 1 }));
  };

  // Dismantling functions
  const toggleDismantleMode = () => {
    setDismantleMode(!dismantleMode);
    setSelectedCards(new Set());
  };

  const toggleCardSelection = (cardId) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const selectAllCards = () => {
    const allSelectableCards = filteredCards
      .filter(userCard => userCard.quantity && userCard.quantity > 1)
      .map(userCard => userCard.cards.id);
    setSelectedCards(new Set(allSelectableCards));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  const handleDismantle = async () => {
    if (selectedCards.size === 0) return;

    setDismantling(true);
    try {
      const response = await fetch('/api/fortune/dismantle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardIds: Array.from(selectedCards)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dismantle cards');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: data.message,
        severity: 'success'
      });

      // Reset selection and refresh collection
      setSelectedCards(new Set());
      setDismantleDialog(false);
      setDismantleMode(false);
      await fetchCollection();

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setDismantling(false);
    }
  };

  const calculateDismantleRewards = () => {
    let totalCoins = 0;
    const details = [];

    selectedCards.forEach(cardId => {
      const userCard = filteredCards.find(uc => uc.cards.id === cardId);
      if (!userCard || !userCard.quantity || userCard.quantity <= 1) return;

      let coinsPerCard, requiredCards;
      switch (userCard.cards.rarity) {
        case 'elite':
          coinsPerCard = 1;
          requiredCards = 3;
          break;
        case 'super_rare':
          coinsPerCard = 2;
          requiredCards = 4;
          break;
        case 'ultra_rare':
          coinsPerCard = 1;
          requiredCards = 5;
          break;
        default:
          return;
      }

      const availableForDismantling = userCard.quantity - 1;
      const setsToDismantle = Math.floor(availableForDismantling / requiredCards);
      if (setsToDismantle > 0) {
        const coins = setsToDismantle * coinsPerCard;
        totalCoins += coins;
        details.push({
          name: userCard.cards.name,
          rarity: userCard.cards.rarity,
          sets: setsToDismantle,
          coins: coins
        });
      }
    });

    return { totalCoins, details };
  };

  if (status === 'loading' || collectionState.loading) {
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
            ⭐ Card Collection
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
            Your Fortune Card treasury
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
                🎮 View Your Collection!
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                Sign in with Discord to see your collected Fortune Cards and track your progress!
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
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
        >
          ⭐ Card Collection
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 2 }}
        >
          Your Fortune Card treasury
        </Typography>
        
        {/* Quick Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/game/fortune/draw')}
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
            🎲 Draw Cards
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/game/fortune/archive')}
            sx={{
              borderColor: 'rgba(33, 150, 243, 0.5)',
              color: '#2196f3',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              px: { xs: 2, sm: 3 },
              '&:hover': {
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            📚 Card Archive
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
      </Box>

      {/* Collection Stats */}
      {collectionState.stats && (
        <Paper sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 4 }, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          overflow: 'auto'
        }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {collectionState.stats.total_collected}
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
            <Grid item xs={6} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  color="secondary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
                >
                  {collectionState.stats.completion_rate}%
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Collection Complete
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <EmojiEvents sx={{ fontSize: { xs: 30, sm: 40 }, color: '#ff9500', mb: 1 }} />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {collectionState.stats.daily_draws} Daily Draws
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Progress Bar */}
          <Box sx={{ mt: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Collection Progress
              </Typography>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {collectionState.stats.total_collected} / {collectionState.stats.total_available}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(collectionState.stats.completion_rate)}
              sx={{ height: { xs: 6, sm: 8 }, borderRadius: 4 }}
            />
          </Box>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search cards..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Rarity</InputLabel>
              <Select
                value={filters.rarity}
                label="Rarity"
                onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
              >
                <MenuItem value="all">All Rarities</MenuItem>
                <MenuItem value="elite">Elite</MenuItem>
                <MenuItem value="super_rare">Super Rare</MenuItem>
                <MenuItem value="ultra_rare">Ultra Rare</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="name">Name A-Z</MenuItem>
                <MenuItem value="rarity">Rarity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilters({ search: '', rarity: 'all', sortBy: 'newest' })}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Dismantling Controls */}
      {filteredCards.length > 0 && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant={dismantleMode ? "contained" : "outlined"}
                color={dismantleMode ? "secondary" : "primary"}
                onClick={toggleDismantleMode}
                startIcon={<Delete />}
              >
                {dismantleMode ? 'Exit Dismantle' : 'Dismantle Cards'}
              </Button>
              
              {dismantleMode && (
                <>
                  <Button
                    size="small"
                    onClick={selectAllCards}
                    startIcon={<SelectAll />}
                    disabled={filteredCards.filter(uc => uc.quantity > 1).length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    onClick={deselectAllCards}
                    startIcon={<DeselectOutlined />}
                    disabled={selectedCards.size === 0}
                  >
                    Deselect All
                  </Button>
                </>
              )}
            </Box>
            
            {dismantleMode && selectedCards.size > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setDismantleDialog(true)}
                  startIcon={<MonetizationOn />}
                >
                  Dismantle Selected
                </Button>
              </Box>
            )}
          </Box>
          
          {dismantleMode && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Select duplicate cards to dismantle them for Airona Coins. You need at least 4-6 copies to dismantle (1 copy will always be kept).
            </Alert>
          )}
        </Paper>
      )}

      {/* Error Display */}
      {collectionState.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCollectionState(prev => ({ ...prev, error: null }))}>
          {collectionState.error}
        </Alert>
      )}

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
            {filteredCards.map((userCard, index) => (
              <Grid item xs={6} sm={4} md={3} key={`${userCard.id}-${index}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <FortuneCard 
                      card={userCard.cards}
                      isRevealed={true}
                      size={isMobile ? "small" : "medium"}
                      showFullDetails={false}
                    />
                    
                    {/* Dismantling Checkbox */}
                    {dismantleMode && (
                      <Box sx={{
                        position: 'absolute',
                        top: { xs: 4, sm: 8 },
                        left: { xs: 4, sm: 8 },
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: 1,
                        p: 0.5
                      }}>
                        <Checkbox
                          checked={selectedCards.has(userCard.cards.id)}
                          onChange={() => toggleCardSelection(userCard.cards.id)}
                          disabled={!userCard.quantity || userCard.quantity <= 1}
                          size="small"
                          sx={{ 
                            color: 'white',
                            '&.Mui-checked': { color: 'primary.main' }
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* Quantity Display */}
                    {userCard.quantity && userCard.quantity > 1 && (
                      <Chip
                        label={`x${userCard.quantity}`}
                        size="small"
                        color="secondary"
                        sx={{
                          position: 'absolute',
                          bottom: { xs: 4, sm: 8 },
                          left: { xs: 4, sm: 8 },
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    
                    {/* Draw Info */}
                    <Box sx={{ 
                      position: 'absolute', 
                      top: { xs: 4, sm: 8 }, 
                      right: { xs: 4, sm: 8 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 0.3, sm: 0.5 }
                    }}>
                      {userCard.is_daily_draw && (
                        <Chip 
                          label="Daily" 
                          size="small" 
                          color="primary"
                          sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' } }}
                        />
                      )}
                      <Chip 
                        label={new Date(userCard.drawn_date).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.5rem', sm: '0.6rem' } }}
                      />
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {collectionState.hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, sm: 4 } }}>
              <Pagination 
                count={10} // Rough estimate, adjust based on your needs
                page={collectionState.page + 1}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          <Star sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
          >
            {filters.search || filters.rarity !== 'all' ? 'No cards match your filters' : 'No cards yet'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {filters.search || filters.rarity !== 'all' ? 
              'Try adjusting your search or filter settings.' :
              'Start your collection by drawing your first Fortune Card!'
            }
          </Typography>
          <Button 
            variant="contained" 
            href="/game/fortune/draw"
            sx={{ mr: 2 }}
          >
            Draw Cards
          </Button>
          {(filters.search || filters.rarity !== 'all') && (
            <Button 
              variant="outlined"
              onClick={() => setFilters({ search: '', rarity: 'all', sortBy: 'newest' })}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Dismantling Confirmation Dialog */}
      <Dialog
        open={dismantleDialog}
        onClose={() => !dismantling && setDismantleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonetizationOn color="primary" />
            Dismantle Cards
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to dismantle {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''}?
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            p: 2, 
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            mb: 2
          }}>
            <Image 
              src="/airona/airona_coin.png" 
              alt="Airona Coin" 
              width={24} 
              height={24} 
            />
            <Typography variant="h6">
              +{calculateDismantleRewards()} Airona Coins
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. Dismantled cards will be permanently removed from your collection.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDismantleDialog(false)}
            disabled={dismantling}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDismantle}
            variant="contained"
            color="primary"
            disabled={dismantling || selectedCards.size === 0}
            startIcon={dismantling ? <CircularProgress size={20} /> : <MonetizationOn />}
          >
            {dismantling ? 'Dismantling...' : 'Dismantle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FortuneCollection;
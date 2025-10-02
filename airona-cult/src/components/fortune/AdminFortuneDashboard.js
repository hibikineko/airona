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
  Grid,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AdminPanelSettings,
  Star,
  MonetizationOn,
  Search,
  Add,
  Remove,
  Edit,
  Visibility,
  AutoAwesome,
  EmojiEvents,
  Save,
  Refresh
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AdminFortuneDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Banner Management State
  const [banners, setBanners] = useState([]);
  const [cards, setCards] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState('limited');
  const [bannerConfig, setBannerConfig] = useState({
    rate_up_ultra_rare_id: null,
    rate_up_super_rare_id: null,
    is_active: true
  });

  // Coin Management State
  const [users, setUsers] = useState([]);
  const [coinStats, setCoinStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [coinDialogOpen, setCoinDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [coinOperation, setCoinOperation] = useState({
    type: 'add',
    amount: '',
    reason: ''
  });

  const rarityColors = {
    ultra_rare: '#FFD700',
    super_rare: '#9932CC',
    elite: '#32CD32'
  };

  // Check if user is admin
  const isAdmin = session?.user?.id === "275152997498224641";

  useEffect(() => {
    if (session?.user?.id && !isAdmin) {
      router.push('/');
      return;
    }
    
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [session, isAdmin, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchBannerData(),
        fetchUserData()
      ]);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBannerData = async () => {
    try {
      const response = await fetch('/api/fortune/admin/banners');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setBanners(data.banners);
      setCards(data.cards);
      
      // Set initial config for limited banner
      const limitedBanner = data.banners.find(b => b.banner_type === 'limited');
      if (limitedBanner) {
        setBannerConfig({
          rate_up_ultra_rare_id: limitedBanner.rate_up_ultra_rare_id,
          rate_up_super_rare_id: limitedBanner.rate_up_super_rare_id,
          is_active: limitedBanner.is_active
        });
      }
    } catch (error) {
      console.error('Error fetching banner data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/fortune/admin/coins?search=${searchTerm}&limit=100`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setUsers(data.users);
      setCoinStats(data.stats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateBannerConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fortune/admin/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerType: selectedBanner,
          rateUpUltraRareId: bannerConfig.rate_up_ultra_rare_id,
          rateUpSuperRareId: bannerConfig.rate_up_super_rare_id,
          isActive: bannerConfig.is_active
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      await fetchBannerData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoinOperation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fortune/admin/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: selectedUser.discord_uid,
          amount: parseInt(coinOperation.amount),
          reason: coinOperation.reason,
          operation: coinOperation.type
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      setCoinDialogOpen(false);
      await fetchUserData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings sx={{ color: 'primary.main' }} />
          Fortune Card Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage banner configurations, rate-up cards, and user coin balances
        </Typography>
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Banner Management" icon={<AutoAwesome />} />
          <Tab label="Coin Management" icon={<MonetizationOn />} />
        </Tabs>
      </Paper>

      {/* Banner Management Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          {/* Banner Selection */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Banner to Configure
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Banner Type</InputLabel>
                <Select
                  value={selectedBanner}
                  onChange={(e) => {
                    setSelectedBanner(e.target.value);
                    const banner = banners.find(b => b.banner_type === e.target.value);
                    if (banner) {
                      setBannerConfig({
                        rate_up_ultra_rare_id: banner.rate_up_ultra_rare_id,
                        rate_up_super_rare_id: banner.rate_up_super_rare_id,
                        is_active: banner.is_active
                      });
                    }
                  }}
                >
                  {banners.map((banner) => (
                    <MenuItem key={banner.banner_type} value={banner.banner_type}>
                      {banner.banner_type === 'limited' ? 'Limited Banner' : 'Standard Banner'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={bannerConfig.is_active}
                    onChange={(e) => setBannerConfig(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                }
                label="Banner Active"
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={updateBannerConfig}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  fullWidth
                >
                  {loading ? 'Updating...' : 'Update Banner'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Rate-up Card Selection */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rate-up Card Configuration
              </Typography>

              {/* Ultra Rare Selection */}
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ color: rarityColors.ultra_rare }} />
                Ultra Rare Rate-up Card
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {cards.filter(card => card.rarity === 'ultra_rare').map((card) => (
                  <Grid item xs={6} sm={4} md={3} key={card.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: bannerConfig.rate_up_ultra_rare_id === card.id ? 3 : 1,
                        borderColor: bannerConfig.rate_up_ultra_rare_id === card.id 
                          ? rarityColors.ultra_rare 
                          : 'transparent',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setBannerConfig(prev => ({ 
                        ...prev, 
                        rate_up_ultra_rare_id: card.id === bannerConfig.rate_up_ultra_rare_id ? null : card.id 
                      }))}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 80,
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
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {card.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Super Rare Selection */}
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome sx={{ color: rarityColors.super_rare }} />
                Super Rare Rate-up Card
              </Typography>
              
              <Grid container spacing={2}>
                {cards.filter(card => card.rarity === 'super_rare').map((card) => (
                  <Grid item xs={6} sm={4} md={3} key={card.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: bannerConfig.rate_up_super_rare_id === card.id ? 3 : 1,
                        borderColor: bannerConfig.rate_up_super_rare_id === card.id 
                          ? rarityColors.super_rare 
                          : 'transparent',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setBannerConfig(prev => ({ 
                        ...prev, 
                        rate_up_super_rare_id: card.id === bannerConfig.rate_up_super_rare_id ? null : card.id 
                      }))}
                    >
                      <CardMedia
                        component="div"
                        sx={{
                          height: 80,
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
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          {card.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Coin Management Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          {/* Coin Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Coin Economy Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {coinStats.totalUsers || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {coinStats.totalCoins || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Coins in Economy
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary.main">
                      {coinStats.averageCoins || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Coins per User
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* User Search */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  placeholder="Search users by name or Discord ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={fetchUserData}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Box>

              {/* Users Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Discord ID</TableCell>
                      <TableCell align="right">Coins</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.discord_uid}>
                        <TableCell>{user.username || 'Unknown'}</TableCell>
                        <TableCell>{user.discord_uid}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={user.airona_coins || 0}
                            color="warning"
                            size="small"
                            icon={<MonetizationOn />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              setSelectedUser(user);
                              setCoinOperation({ type: 'add', amount: '', reason: '' });
                              setCoinDialogOpen(true);
                            }}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Coin Operation Dialog */}
      <Dialog open={coinDialogOpen} onClose={() => setCoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Coins for {selectedUser?.username || selectedUser?.discord_uid}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Operation</InputLabel>
              <Select
                value={coinOperation.type}
                onChange={(e) => setCoinOperation(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="add">Add Coins</MenuItem>
                <MenuItem value="remove">Remove Coins</MenuItem>
                <MenuItem value="set">Set Coins</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={coinOperation.amount}
              onChange={(e) => setCoinOperation(prev => ({ ...prev, amount: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Reason (optional)"
              value={coinOperation.reason}
              onChange={(e) => setCoinOperation(prev => ({ ...prev, reason: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />

            {selectedUser && (
              <Alert severity="info">
                Current balance: {selectedUser.airona_coins || 0} coins
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoinDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCoinOperation}
            variant="contained"
            disabled={!coinOperation.amount || loading}
          >
            {loading ? 'Processing...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminFortuneDashboard;
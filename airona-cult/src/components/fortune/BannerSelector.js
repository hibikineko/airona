'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  Fade
} from '@mui/material';
import { Star, AutoAwesome, AccessTime } from '@mui/icons-material';
import Image from 'next/image';

const BannerSelector = ({ selectedBanner, onBannerChange, disabled = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/fortune/banners');
        if (!response.ok) throw new Error('Failed to fetch banners');
        
        const data = await response.json();
        setBanners(data.banners || []);
        
        // Set default banner if none selected
        if (!selectedBanner && data.banners.length > 0) {
          onBannerChange(data.banners[0].banner_type);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        setError('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [selectedBanner, onBannerChange]);

  const handleTabChange = (event, newValue) => {
    if (!disabled) {
      onBannerChange(newValue);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'ultra_rare':
        return '#FFD700'; // Gold
      case 'super_rare':
        return '#9932CC'; // Purple
      case 'elite':
        return '#32CD32'; // Green
      default:
        return '#808080'; // Gray
    }
  };

  const getBannerIcon = (bannerType) => {
    switch (bannerType) {
      case 'limited':
        return <AutoAwesome sx={{ color: '#FFD700' }} />;
      case 'standard':
        return <Star sx={{ color: '#4169E1' }} />;
      default:
        return <Star />;
    }
  };

  const formatBannerName = (bannerType) => {
    switch (bannerType) {
      case 'limited':
        return 'Limited Banner';
      case 'standard':
        return 'Standard Banner';
      default:
        return bannerType.charAt(0).toUpperCase() + bannerType.slice(1);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading banners...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  const selectedBannerData = banners.find(b => b.banner_type === selectedBanner);

  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      {/* Banner Tabs */}
      <Tabs
        value={selectedBanner}
        onChange={handleTabChange}
        variant={isMobile ? 'fullWidth' : 'centered'}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 60,
            fontSize: '1rem',
            fontWeight: 'bold'
          }
        }}
      >
        {banners.map((banner) => (
          <Tab
            key={banner.banner_type}
            value={banner.banner_type}
            disabled={disabled}
            icon={getBannerIcon(banner.banner_type)}
            iconPosition="start"
            label={
              <Box sx={{ textAlign: 'left', pl: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {formatBannerName(banner.banner_type)}
                </Typography>
                {banner.banner_type === 'limited' && (
                  <Chip 
                    label="Rate Up!" 
                    size="small" 
                    color="warning"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            }
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20'
              }
            }}
          />
        ))}
      </Tabs>

      {/* Rate-up Cards Display */}
      {selectedBannerData && selectedBannerData.banner_type === 'limited' && (
        <Fade in={true}>
          <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: '#FFD700' }} />
              Featured Rate-Up Cards (75% chance)
            </Typography>
            
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={2} 
              sx={{ justifyContent: 'center' }}
            >
              {/* Ultra Rare Rate-up */}
              {selectedBannerData.rate_up_ultra_rare && selectedBannerData.rate_up_ultra_rare.airona_sticker_path && (
                <Card 
                  sx={{ 
                    maxWidth: 200,
                    border: 2,
                    borderColor: getRarityColor('ultra_rare'),
                    boxShadow: `0 0 10px ${getRarityColor('ultra_rare')}40`
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 120,
                        position: 'relative',
                        backgroundColor: selectedBannerData.rate_up_ultra_rare.background_color || getRarityColor('ultra_rare')
                      }}
                    >
                      <Image
                        src={selectedBannerData.rate_up_ultra_rare.airona_sticker_path}
                        alt={selectedBannerData.rate_up_ultra_rare.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </CardMedia>
                    <Chip
                      label="Ultra Rare"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: getRarityColor('ultra_rare'),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ pt: 1, pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {selectedBannerData.rate_up_ultra_rare.name}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Super Rare Rate-up */}
              {selectedBannerData.rate_up_super_rare && selectedBannerData.rate_up_super_rare.airona_sticker_path && (
                <Card 
                  sx={{ 
                    maxWidth: 200,
                    border: 2,
                    borderColor: getRarityColor('super_rare'),
                    boxShadow: `0 0 10px ${getRarityColor('super_rare')}40`
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 120,
                        position: 'relative',
                        backgroundColor: selectedBannerData.rate_up_super_rare.background_color || getRarityColor('super_rare')
                      }}
                    >
                      <Image
                        src={selectedBannerData.rate_up_super_rare.airona_sticker_path}
                        alt={selectedBannerData.rate_up_super_rare.name}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </CardMedia>
                    <Chip
                      label="Super Rare"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: getRarityColor('super_rare'),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ pt: 1, pb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      {selectedBannerData.rate_up_super_rare.name}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Stack>

            {/* Rate-up Information */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                When you pull an Ultra Rare or Super Rare card, there&apos;s a 75% chance it will be one of the featured cards above!
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Standard Banner Info */}
      {selectedBannerData && selectedBannerData.banner_type === 'standard' && (
        <Fade in={true}>
          <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star sx={{ color: '#4169E1' }} />
              Standard Banner
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              All cards available at normal rates. Perfect for building your collection!
            </Typography>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default BannerSelector;
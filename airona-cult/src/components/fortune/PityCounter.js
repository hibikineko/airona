'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Chip,
  Tooltip,
  useTheme,
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  AutoAwesome, 
  EmojiEvents, 
  TrendingUp,
  Info
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

const PityCounter = forwardRef(({ bannerType = 'standard', onUpdate }, ref) => {
  const { data: session } = useSession();
  const theme = useTheme();
  
  const [pityCount, setPityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PITY_LIMIT = 20; // Guaranteed Ultra Rare every 20 pulls

  // Fetch pity counter from user stats
  const fetchPityCount = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/fortune/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      const stats = data.stats;
      
      if (stats) {
        const count = bannerType === 'limited' 
          ? stats.limited_pity_counter || 0
          : stats.standard_pity_counter || 0;
        
        setPityCount(count);
        
        // Notify parent component
        if (onUpdate) {
          onUpdate(count, PITY_LIMIT - count);
        }
      }
    } catch (error) {
      console.error('Error fetching pity count:', error);
      setError('Failed to load pity data');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchPityCount
  }));

  useEffect(() => {
    if (session?.user?.id) {
      fetchPityCount();
    }
  }, [session?.user?.id, bannerType]);

  // Calculate progress values
  const progress = (pityCount / PITY_LIMIT) * 100;
  const pullsUntilGuaranteed = PITY_LIMIT - pityCount;
  const isGuaranteed = pityCount >= PITY_LIMIT - 1; // Next pull is guaranteed

  // Don't show for unauthenticated users
  if (!session?.user?.id) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading pity counter...</Typography>
      </Box>
    );
  }

  if (error) {
    return null; // Silently fail for pity counter
  }

  return (
    <Fade in={!loading}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: isGuaranteed 
            ? theme.palette.warning.main + '10'
            : theme.palette.background.paper,
          border: 1,
          borderColor: isGuaranteed 
            ? theme.palette.warning.main + '40'
            : theme.palette.divider,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {isGuaranteed ? (
            <EmojiEvents sx={{ color: 'warning.main' }} />
          ) : (
            <AutoAwesome sx={{ color: 'primary.main' }} />
          )}
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {isGuaranteed ? 'Ultra Rare Guaranteed!' : 'Pity Counter'}
          </Typography>
          
          <Tooltip title="You're guaranteed an Ultra Rare card every 20 pulls without getting one">
            <Info sx={{ color: 'text.secondary', fontSize: 16 }} />
          </Tooltip>
          
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${bannerType === 'limited' ? 'Limited' : 'Standard'} Banner`}
              size="small"
              variant="outlined"
              color={bannerType === 'limited' ? 'warning' : 'primary'}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: isGuaranteed 
                  ? theme.palette.warning.main
                  : theme.palette.primary.main,
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {pityCount} / {PITY_LIMIT} pulls without Ultra Rare
          </Typography>
          
          {isGuaranteed ? (
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'warning.main', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <EmojiEvents fontSize="small" />
              Next pull guaranteed!
            </Typography>
          ) : (
            <Typography variant="body2" color="primary.main">
              {pullsUntilGuaranteed} pulls until guaranteed
            </Typography>
          )}
        </Box>

        {/* Progress indicator with emojis */}
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {Array.from({ length: Math.min(PITY_LIMIT, 10) }, (_, i) => {
              const pullNumber = i + 1;
              const isActive = pullNumber <= pityCount;
              const isGuaranteedPull = pullNumber === PITY_LIMIT;
              
              return (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: isActive 
                      ? (isGuaranteedPull ? theme.palette.warning.main : theme.palette.primary.main)
                      : theme.palette.grey[300],
                    border: isGuaranteedPull ? 2 : 0,
                    borderColor: theme.palette.warning.main
                  }}
                />
              );
            })}
            {PITY_LIMIT > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ...{PITY_LIMIT}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
});

PityCounter.displayName = 'PityCounter';

export default PityCounter;
'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  MonetizationOn, 
  History, 
  Info,
  TrendingUp,
  TrendingDown,
  Add,
  Remove
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const CoinBalance = forwardRef(({ onBalanceUpdate, showHistory = true, size = 'medium' }, ref) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch coin balance
  const fetchBalance = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/fortune/coins/balance');
      if (!response.ok) throw new Error('Failed to fetch balance');
      
      const data = await response.json();
      setBalance(data.balance || 0);
      
      // Notify parent component of balance update
      if (onBalanceUpdate) {
        onBalanceUpdate(data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchBalance
  }));

  // Fetch transaction history
  const fetchHistory = async () => {
    if (!session?.user?.id) return;

    try {
      setHistoryLoading(true);
      const response = await fetch('/api/fortune/coins/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
    }
  }, [session?.user?.id]);

  const handleHistoryOpen = () => {
    setHistoryOpen(true);
    fetchHistory();
  };

  const formatTransactionType = (type) => {
    switch (type) {
      case 'earned':
        return 'Earned';
      case 'spent':
        return 'Spent';
      case 'admin_add':
        return 'Admin Add';
      case 'admin_remove':
        return 'Admin Remove';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTransactionIcon = (type, amount) => {
    if (amount > 0) {
      return <TrendingUp sx={{ color: 'success.main' }} />;
    } else {
      return <TrendingDown sx={{ color: 'error.main' }} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Don't show for unauthenticated users
  if (!session?.user?.id) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading balance...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Chip 
        label="Balance Error" 
        color="error" 
        size={size}
        icon={<MonetizationOn />}
      />
    );
  }

  const coinDisplay = (
    <Fade in={!loading}>
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: theme.palette.warning.main + '20',
          border: 1,
          borderColor: theme.palette.warning.main + '40',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Image
            src="/airona/airona_coin.png"
            alt="Airona Coin"
            width={size === 'large' ? 32 : 24}
            height={size === 'large' ? 32 : 24}
            style={{ objectFit: 'contain' }}
          />
        </Box>
        <Box>
          <Typography 
            variant={size === 'large' ? 'h6' : 'subtitle1'} 
            sx={{ fontWeight: 'bold', color: 'warning.main' }}
          >
            {balance.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Airona Coins
          </Typography>
        </Box>
        
        {showHistory && (
          <Tooltip title="View transaction history">
            <IconButton 
              size="small" 
              onClick={handleHistoryOpen}
              sx={{ ml: 1 }}
            >
              <History />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="1 coin = 1 card draw">
          <IconButton size="small">
            <Info />
          </IconButton>
        </Tooltip>
      </Paper>
    </Fade>
  );

  return (
    <>
      {coinDisplay}

      {/* Transaction History Dialog */}
      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History />
          Coin Transaction History
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
              No transactions yet. Start drawing cards to see your history!
            </Typography>
          ) : (
            <List>
              {transactions.map((transaction, index) => (
                <ListItem key={index} divider>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                    {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  </Box>
                  <ListItemText
                    primary={
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span">
                          {formatTransactionType(transaction.transaction_type)}
                        </Typography>
                        <Chip
                          label={`${transaction.amount > 0 ? '+' : ''}${transaction.amount}`}
                          size="small"
                          color={transaction.amount > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </span>
                    }
                    secondary={
                      <span>
                        {transaction.reason && (
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            {transaction.reason}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                          {formatDate(transaction.created_at)}
                        </Typography>
                      </span>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

CoinBalance.displayName = 'CoinBalance';

export default CoinBalance;
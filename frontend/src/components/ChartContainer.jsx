import React from 'react';
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const ChartContainer = ({ title, subtitle, loading, error, children, height = 400 }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      {/* Chart Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Chart Content */}
      <Box sx={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading chart data...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            <Typography variant="body2">
              {error.message || 'Failed to load chart data. Please try again.'}
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ width: '100%', height: '100%' }}>
            {children}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ChartContainer;
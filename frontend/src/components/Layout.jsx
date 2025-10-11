import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SportsIcon from '@mui/icons-material/Sports';

const Layout = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { path: '/', label: 'Home', description: 'Dashboard' },
    { path: '/extra-runs', label: 'Extra Runs', description: 'By Team' },
    { path: '/bowlers', label: 'Bowlers', description: 'Economical' },
    { path: '/team-stats', label: 'Team Stats', description: 'Played vs Won' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={2} sx={{ background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
        <Toolbar>
          <SportsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            IPL Analytics Dashboard
          </Typography>
          
          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  minWidth: 'auto',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: 1 }}>
                  {item.description}
                </Typography>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
          {children}
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          IPL Analytics Dashboard | Built with React & Material UI
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
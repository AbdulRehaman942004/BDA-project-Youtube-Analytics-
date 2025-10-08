import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  Search,
  Home,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <TrendingUp sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            YouTube Trends Analytics
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            startIcon={<TrendingUp />}
            onClick={() => navigate('/trending')}
            sx={{
              backgroundColor: isActive('/trending') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Trending
          </Button>
          <Button
            color="inherit"
            startIcon={<Analytics />}
            onClick={() => navigate('/analytics')}
            sx={{
              backgroundColor: isActive('/analytics') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Analytics
          </Button>
          <Button
            color="inherit"
            startIcon={<Search />}
            onClick={() => navigate('/search')}
            sx={{
              backgroundColor: isActive('/search') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Search
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          onClick={handleMenuOpen}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuItem onClick={() => handleNavigation('/')}>
            <Home sx={{ mr: 1 }} />
            Dashboard
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/trending')}>
            <TrendingUp sx={{ mr: 1 }} />
            Trending
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/analytics')}>
            <Analytics sx={{ mr: 1 }} />
            Analytics
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/search')}>
            <Search sx={{ mr: 1 }} />
            Search
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

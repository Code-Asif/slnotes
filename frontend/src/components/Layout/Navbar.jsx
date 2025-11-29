import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  ListItemIcon,
  Divider,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TranslateIcon from '@mui/icons-material/Translate';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import useThemeStore from '../../store/useThemeStore';
import logoImage from '../../images/logo.png';
import GoogleTranslate from '../GoogleTranslate';
import { getCurrentLanguage, toggleTranslation } from '../../utils/translate';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleMode } = useThemeStore();
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState('en');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Update language state on mount and periodically
    const updateLanguage = () => {
      setCurrentLang(getCurrentLanguage());
    };

    updateLanguage();
    const interval = setInterval(updateLanguage, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTranslate = () => {
    toggleTranslation();
    setCurrentLang(getCurrentLanguage());
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Materials', path: '/materials', icon: <MenuBookIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
    { label: 'Contact', path: '/contact', icon: <ContactMailIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="Logo"
          sx={{
            height: 40,
            width: 'auto',
            mb: 1,
            objectFit: 'contain',
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          SalmanNotes
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={handleDrawerToggle}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              handleTranslate();
              handleDrawerToggle();
            }}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <TranslateIcon />
            </ListItemIcon>
            <ListItemText 
              primary={currentLang === 'hi' ? 'Switch to English' : 'Switch to Hindi (हिंदी)'}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/admin/login"
            onClick={handleDrawerToggle}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Admin Login" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              toggleMode();
              handleDrawerToggle();
            }}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.5),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.95)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: { xs: 1, md: 3 },
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="MaterialPro Logo"
              sx={{
                height: { xs: 35, md: 45 },
                width: 'auto',
                mr: 1.5,
                objectFit: 'contain',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                background: mode === 'dark' 
                  ? 'linear-gradient(45deg, #fff 30%, #e0e0e0 90%)'
                  : 'linear-gradient(45deg, #fff 30%, #f5f5f5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SalmanNotes
            </Typography>
          </Box>
          
          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                color="inherit"
                aria-label="toggle theme"
                onClick={toggleMode}
                sx={{
                  mr: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4, gap: 1, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    textTransform: 'none',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: 'relative',
                    '&::after': location.pathname === item.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                    } : {},
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Box sx={{ flexGrow: 1 }} />
              <GoogleTranslate />
              <Button
                component={Link}
                to="/admin/login"
                color="inherit"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{
                  textTransform: 'none',
                  ml: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.15),
                    borderColor: alpha(theme.palette.common.white, 0.5),
                  },
                }}
              >
                Admin
              </Button>
              <IconButton
                onClick={toggleMode}
                color="inherit"
                aria-label="toggle theme"
                sx={{
                  ml: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;


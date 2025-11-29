import { Box, Container, Typography, Link as MuiLink, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import logoImage from '../../images/logo.png';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center">
          <Box
            component="img"
            src={logoImage}
            alt="MaterialPro Logo"
            sx={{
              height: 40,
              width: 'auto',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
            }}
          />
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Salman Nafis Notes. All rights reserved.
          </Typography>
          <Typography variant="body2" align="center">
            Premium Educational Materials Platform
          </Typography>
          <Typography variant="body2" align="center">
            Made with ❤️ by <a style={{ color: 'black', textDecoration: 'none', fontWeight: 'bold' }} href="https://mdafzal.netlify.app" target="_blank" rel="noopener noreferrer">Md Afzal</a>
          </Typography>
          <MuiLink
            component={Link}
            to="/admin/login"
            sx={{
              color: 'primary.contrastText',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                opacity: 0.8,
              },
            }}
          >
            Admin Login
          </MuiLink>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;


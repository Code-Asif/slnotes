import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | MaterialPro</title>
      </Helmet>
      <PublicLayout>
        <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h1" component="h1" gutterBottom fontWeight="bold">
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The page you are looking for does not exist.
          </Typography>
          <Button component={Link} to="/" variant="contained" size="large">
            Go to Home
          </Button>
        </Container>
      </PublicLayout>
    </>
  );
};

export default NotFoundPage;


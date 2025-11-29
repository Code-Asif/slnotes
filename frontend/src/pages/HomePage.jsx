import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';
import api from '../utils/api';
import logoImage from '../images/logo.png';

const HomePage = () => {
  const [featuredMaterials, setFeaturedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/materials/featured');
        setFeaturedMaterials(response.materials || []);
      } catch (error) {
        console.error('Error fetching featured materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <>
      <Helmet>
        <title>MaterialPro - Premium Educational Materials</title>
        <meta name="description" content="Browse and purchase premium educational materials including notes, test papers, and DPPs for JEE, NEET, and more." />
      </Helmet>
      
      <PublicLayout>
        {/* Hero Section with 3D */}
        <Box
          sx={{
            position: 'relative',
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                    Premium Educational Materials
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                    Access high-quality notes, test papers, and DPPs for JEE, NEET, and more
                  </Typography>
                  <Button
                    component={Link}
                    to="/materials"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                  >
                    Browse Materials
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ height: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Box
                    component="img"
                    src={logoImage}
                    alt="MaterialPro"
                    sx={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Featured Materials Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight="bold">
            Featured Materials
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Handpicked premium content for your success
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredMaterials.length === 0 ? (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary">
                    No featured materials available yet.
                  </Typography>
                </Grid>
              ) : (
                featuredMaterials.map((material, index) => (
                  <Grid item xs={12} sm={6} md={4} key={material._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        {material.previewImageId ? (
                          <CardMedia
                            component="img"
                            height="200"
                            image={`${import.meta.env.VITE_API_URL || '/api'}/materials/${material._id}/preview`}
                            alt={material.title}
                            sx={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 200,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100',
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              No Preview
                            </Typography>
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {material.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {material.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {material.classLevel && (
                              <Chip label={`Class ${material.classLevel}`} size="small" />
                            )}
                            {material.category && (
                              <Chip label={material.category} size="small" color="primary" variant="outlined" />
                            )}
                          </Box>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {material.priceINR === 0 ? 'Free' : `₹${material.priceINR}`}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button
                            component={Link}
                            to={`/materials/${material._id}`}
                            fullWidth
                            variant="contained"
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          <Box textAlign="center" mt={4}>
            <Button
              component={Link}
              to="/materials"
              variant="outlined"
              size="large"
            >
              View All Materials
            </Button>
          </Box>

          {/* Category Quick Links - Enhanced */}
          <Box sx={{ mt: 10, mb: 8 }}>
            <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight="bold">
              Browse by Category
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
              Explore comprehensive study materials for all your academic needs
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {[
                { 
                  label: 'JEE Materials', 
                  category: 'JEE', 
                  icon: <CalculateIcon sx={{ fontSize: 48 }} />,
                  description: 'Complete JEE preparation materials',
                  color: '#1976d2'
                },
                { 
                  label: 'NEET Materials', 
                  category: 'NEET', 
                  icon: <ScienceIcon sx={{ fontSize: 48 }} />,
                  description: 'Medical entrance exam resources',
                  color: '#9c27b0'
                },
                { 
                  label: 'Class 7', 
                  classLevel: '7', 
                  icon: <SchoolIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 7 study materials',
                  color: '#2e7d32'
                },
                { 
                  label: 'Class 8', 
                  classLevel: '8', 
                  icon: <SchoolIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 8 study materials',
                  color: '#388e3c'
                },
                { 
                  label: 'Class 9', 
                  classLevel: '9', 
                  icon: <SchoolIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 9 study materials',
                  color: '#43a047'
                },
                { 
                  label: 'Class 10', 
                  classLevel: '10', 
                  icon: <SchoolIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 10 board preparation',
                  color: '#66bb6a'
                },
                { 
                  label: 'Class 11', 
                  classLevel: '11', 
                  icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 11 advanced materials',
                  color: '#0288d1'
                },
                { 
                  label: 'Class 12', 
                  classLevel: '12', 
                  icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
                  description: 'Class 12 board & competitive',
                  color: '#039be5'
                },
                { 
                  label: 'Foundation', 
                  category: 'Foundation', 
                  icon: <PsychologyIcon sx={{ fontSize: 48 }} />,
                  description: 'Foundation course materials',
                  color: '#f57c00'
                },
                { 
                  label: 'Olympiad', 
                  category: 'Olympiad', 
                  icon: <EmojiEventsIcon sx={{ fontSize: 48 }} />,
                  description: 'Olympiad preparation resources',
                  color: '#d32f2f'
                },
                { 
                  label: 'Others', 
                  category: 'Class', 
                  icon: <MenuBookIcon sx={{ fontSize: 48 }} />,
                  description: 'Additional study materials',
                  color: '#616161'
                },
              ].map((cat) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Paper
                      component={Link}
                      to={`/materials?${cat.category ? `category=${cat.category}` : `classLevel=${cat.classLevel}`}`}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'all 0.3s ease',
                        border: `2px solid ${cat.color}20`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                          borderColor: cat.color,
                          bgcolor: `${cat.color}08`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: cat.color,
                          mb: 2,
                        }}
                      >
                        {cat.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {cat.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cat.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Educational Content Section */}
          <Box sx={{ mt: 10, mb: 8 }}>
            <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight="bold">
              Why Choose Our Platform?
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {[
                {
                  title: 'Comprehensive Study Materials',
                  description: 'Access a vast collection of notes, test papers, and DPPs covering all subjects and competitive exams.',
                  icon: <MenuBookIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
                },
                {
                  title: 'Expert-Curated Content',
                  description: 'All materials are carefully selected and reviewed by experienced educators to ensure quality and relevance.',
                  icon: <SchoolIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
                },
                {
                  title: 'Affordable Pricing',
                  description: 'Get premium educational resources at student-friendly prices, with many free materials available.',
                  icon: <EmojiEventsIcon sx={{ fontSize: 60, color: 'success.main' }} />,
                },
                {
                  title: 'Regular Updates',
                  description: 'Our content library is constantly updated with new materials aligned with latest syllabus and exam patterns.',
                  icon: <ScienceIcon sx={{ fontSize: 60, color: 'info.main' }} />,
                },
              ].map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </PublicLayout>
    </>
  );
};

export default HomePage;


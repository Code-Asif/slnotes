import { Container, Typography, Box, Paper, Grid, useTheme, Avatar, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';
import { motion } from 'framer-motion';
import ownerImage from '../images/Owner.jpg';

const AboutPage = () => {
  const theme = useTheme();

  return (
    <PublicLayout>
      <Helmet>
        <title>About Us - MaterialPro</title>
        <meta name="description" content="Learn more about MaterialPro - Your one-stop solution for educational materials" />
      </Helmet>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700, 
            mb: 4,
            color: 'primary.main',
            textAlign: 'center'
          }}>
            About MaterialPro
          </Typography>
          
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, textAlign: 'center' }}>
            Empowering students with high-quality educational resources
          </Typography>
          
          <Box sx={{ my: 6 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  height: '100%',
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Our Mission
                  </Typography>
                  <Typography paragraph>
                    At MaterialPro, we&apos;re dedicated to providing students with access to high-quality educational materials 
                    that make learning more accessible and effective. We believe that everyone deserves the opportunity to 
                    excel in their academic journey.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  height: '100%',
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Our Vision
                  </Typography>
                  <Typography paragraph>
                    We envision a world where every student has access to the resources they need to succeed, 
                    regardless of their location or background. Our platform bridges the gap between quality 
                    education and students worldwide.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ my: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ 
              fontWeight: 600, 
              mb: 4,
              color: 'primary.main',
              textAlign: 'center'
            }}>
              Why Choose Salman Nafis Notes?
            </Typography>
            
            <Grid container spacing={3}>
              {[
                {
                  title: 'Quality Content',
                  description: 'Carefully curated and verified educational materials from trusted sources.'
                },
                {
                  title: 'Wide Range',
                  description: 'Materials available for various subjects, classes, and competitive exams.'
                },
                {
                  title: 'Affordable',
                  description: 'High-quality resources at student-friendly prices, with many free options.'
                },
                {
                  title: 'Mobile-Friendly',
                  description: 'Access your study materials anytime, anywhere, on any device.'
                },
                {
                  title: 'Easy Access',
                  description: 'Instant downloads and easy-to-navigate interface for seamless learning.'
                },
                {
                  title: 'Regular Updates',
                  description: 'Our content library is constantly updated with new and relevant materials.'
                }
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      },
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)'
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Owner Section */}
          <Box sx={{ mt: 8, mb: 6 }}>
            <Divider sx={{ my: 6 }} />
            <Typography variant="h4" component="h2" gutterBottom sx={{ 
              fontWeight: 600, 
              mb: 4,
              color: 'primary.main',
              textAlign: 'center'
            }}>
              Meet the Founder
            </Typography>
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Avatar
                    src={ownerImage}
                    alt="Owner"
                    sx={{
                      width: 250,
                      height: 250,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: theme.shadows[8],
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                      About the Founder
                    </Typography>
                    <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      With a passion for education and technology, our founder envisioned a platform that would 
                      democratize access to quality educational materials. Having experienced the challenges 
                      students face in accessing premium study resources, the mission was clear: create an 
                      affordable, accessible, and user-friendly platform that bridges the gap between quality 
                      education and students worldwide.
                    </Typography>
                    <Typography variant="body1" paragraph color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Through dedication and innovation, MaterialPro was born - a platform that empowers students 
                      to excel in their academic journey by providing them with the resources they need, when 
                      they need them, at prices they can afford.
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Have questions?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're here to help! Reach out to our support team for any inquiries.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>
                Email: coachingwork2409@gmail.com
              </Typography>
              <Typography variant="body1" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                Phone: +91 72600 23491
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </PublicLayout>
  );
};

export default AboutPage;

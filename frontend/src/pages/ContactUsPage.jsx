import { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Paper, Alert, useTheme } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';

const ContactUsPage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' });
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ 
          type: 'success', 
          message: data.message || 'Your message has been sent successfully! We&apos;ll get back to you soon.' 
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: data.message || 'Failed to send message. Please try again later.' 
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      icon: <EmailIcon color="primary" fontSize="large" />, 
      title: 'Email Us',
      text: 'coachingwork2409@gmail.com',
      link: 'mailto:coachingwork2409@gmail.com'
    },
    { 
      icon: <PhoneIcon color="primary" fontSize="large" />, 
      title: 'Call Us',
      text: '+91 72600 23491',
      link: 'tel:+9172600 23491'
    },
    { 
      icon: <LocationOnIcon color="primary" fontSize="large" />, 
      title: 'Location',
      text: 'Rajkot, Gujarat, India',
      link: 'https://maps.google.com'
    },
    { 
      icon: <ScheduleIcon color="primary" fontSize="large" />, 
      title: 'Working Hours',
      text: 'Mon - Fri: 9:00 - 18:00',
      text2: 'Sat: 10:00 - 15:00',
      link: ''
    },
  ];

  return (
    <PublicLayout>
      <Helmet>
        <title>Contact Us - MaterialPro</title>
        <meta name="description" content="Get in touch with MaterialPro. We're here to help with any questions or feedback." />
      </Helmet>
      
      <Box sx={{
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        py: 8,
        mb: 6
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" align="center" sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 2
          }}>
            Contact Us
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Have questions or feedback? We&apos;d love to hear from you. Reach out to our team and we&apos;ll get back to you as soon as possible.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Get in Touch
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We&apos;re here to help and answer any questions you might have. We look forward to hearing from you.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {contactInfo.map((item, index) => (
                <Grid item xs={12} sm={6} md={12} key={index}>
                  <Box 
                    component={item.link ? 'a' : 'div'}
                    href={item.link || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      textDecoration: 'none',
                      color: 'inherit',
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.02)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.text}
                      </Typography>
                      {item.text2 && (
                        <Typography variant="body2" color="text.secondary">
                          {item.text2}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Send us a Message
              </Typography>
              
              {status.message && (
                <Alert 
                  severity={status.type} 
                  sx={{ mb: 3 }}
                  onClose={() => setStatus({ type: '', message: '' })}
                >
                  {status.message}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Your Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
};

export default ContactUsPage;

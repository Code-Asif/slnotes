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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import PublicLayout from '../components/Layout/PublicLayout';
import api from '../utils/api';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    classLevel: '',
    category: '',
    subject: '',
    isFree: '',
    isFeatured: '',
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
          ),
        };
        const response = await api.get('/materials', { params });
        if (response.success !== false) {
          setMaterials(response.materials || []);
          setTotalPages(response.pagination?.pages || 1);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setMaterials([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [page, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>Materials - MaterialPro</title>
        <meta name="description" content="Browse our collection of educational materials for JEE, NEET, and more." />
      </Helmet>
      
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" align="center">
            Browse Materials
          </Typography>

          {/* Filters */}
          <Box sx={{ mb: 4, mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search"
                  variant="outlined"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search materials..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={filters.classLevel}
                    label="Class"
                    onChange={(e) => handleFilterChange('classLevel', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {['9', '10', '11', '12'].map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        Class {cls}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {['Class', 'JEE', 'NEET', 'Foundation', 'Olympiad'].map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Price</InputLabel>
                  <Select
                    value={filters.isFree}
                    label="Price"
                    onChange={(e) => handleFilterChange('isFree', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Free</MenuItem>
                    <MenuItem value="false">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Featured</InputLabel>
                  <Select
                    value={filters.isFeatured}
                    label="Featured"
                    onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Materials Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {materials.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography align="center" color="text.secondary" py={4}>
                      No materials found.
                    </Typography>
                  </Grid>
                ) : (
                  materials.map((material, index) => (
                    <Grid item xs={12} sm={6} md={4} key={material._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
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
                          {material.previewImageId && (
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
                          )}
                          {!material.previewImageId && (
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
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                              {material.classLevel && (
                                <Chip label={`Class ${material.classLevel}`} size="small" />
                              )}
                              {material.category && (
                                <Chip
                                  label={material.category}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {material.isFeatured && (
                                <Chip label="Featured" size="small" color="secondary" />
                              )}
                            </Stack>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </PublicLayout>
    </>
  );
};

export default MaterialsPage;


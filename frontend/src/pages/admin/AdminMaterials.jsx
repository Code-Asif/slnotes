import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Grid,
  Checkbox,
  Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classLevel: '',
    category: 'Class',
    priceINR: 0,
    tags: '',
    isFeatured: false,
    versionNote: '',
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [fileData, setFileData] = useState({
    pdf: null,
    previewImage: null,
    coverImage: null,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/materials', { params: { limit: 1000 } });
      if (response.success !== false) {
        setMaterials(response.materials || []);
      } else {
        setMaterials([]);
        toast.error('Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch materials';
      toast.error(errorMessage);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title || '',
        description: material.description || '',
        subject: material.subject || '',
        classLevel: material.classLevel || '',
        category: material.category || 'Class',
        priceINR: material.priceINR || 0,
        tags: material.tags?.join(', ') || '',
        isFeatured: material.isFeatured || false,
        versionNote: '',
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: '',
        description: '',
        subject: '',
        classLevel: '',
        category: 'Class',
        priceINR: 0,
        tags: '',
        isFeatured: false,
        versionNote: '',
      });
    }
    setFileData({ pdf: null, coverImage: null });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
    setFileData({ pdf: null, previewImage: null, coverImage: null });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = 'Description is required';
    }
    
    if (formData.priceINR < 0) {
      errors.priceINR = 'Price cannot be negative';
    }
    
    if (!editingMaterial && !fileData.pdf) {
      errors.pdf = 'File is required for new materials';
    }
    
    // No file size restrictions - removed
    
    if (fileData.previewImage) {
      if (!fileData.previewImage.type.startsWith('image/')) {
        errors.previewImage = 'Only image files are allowed for preview';
      }
    }
    
    if (fileData.coverImage) {
      if (!fileData.coverImage.type.startsWith('image/')) {
        errors.coverImage = 'Only image files are allowed';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== 'isFeatured') {
        form.append(key, formData[key]);
      } else {
        form.append(key, formData[key] ? 'true' : 'false');
      }
    });

    if (fileData.pdf) {
      form.append('file', fileData.pdf);
      form.append('fileNameOriginal', fileData.pdf.name);
      if (editingMaterial && formData.versionNote) {
        form.append('versionNote', formData.versionNote);
      }
    }
    if (fileData.previewImage) {
      form.append('previewImage', fileData.previewImage);
    }
    if (fileData.coverImage) {
      form.append('coverImage', fileData.coverImage);
    }

    try {
      if (editingMaterial) {
        // Update
        const updateForm = new FormData();
        Object.keys(formData).forEach((key) => {
          updateForm.append(key, formData[key] ? formData[key].toString() : '');
        });
        if (fileData.pdf) {
          updateForm.append('file', fileData.pdf);
          if (formData.versionNote) {
            updateForm.append('versionNote', formData.versionNote);
          }
        }
        if (fileData.previewImage) {
          updateForm.append('previewImage', fileData.previewImage);
        }
        if (fileData.coverImage) updateForm.append('coverImage', fileData.coverImage);

        await api.put(`/admin/materials/${editingMaterial._id}`, updateForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Material updated successfully');
      } else {
        // Create
        await api.post('/admin/materials', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Material created successfully');
      }
      handleCloseDialog();
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save material';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await api.delete(`/admin/materials/${id}`);
      toast.success('Material deleted successfully');
      fetchMaterials();
      setSelectedMaterials([]);
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedMaterials.length} materials?`)) {
      return;
    }

    try {
      await Promise.all(selectedMaterials.map(id => api.delete(`/admin/materials/${id}`)));
      toast.success(`${selectedMaterials.length} materials deleted successfully`);
      setSelectedMaterials([]);
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting materials:', error);
      toast.error('Failed to delete some materials');
    }
  };

  const handleBulkFeatured = async () => {
    try {
      // Get current featured status of first material
      const firstMaterial = materials.find(m => m._id === selectedMaterials[0]);
      const newFeaturedStatus = !firstMaterial?.isFeatured;

      await Promise.all(
        selectedMaterials.map(id => 
          api.put(`/admin/materials/${id}`, { isFeatured: newFeaturedStatus })
        )
      );
      toast.success(`${selectedMaterials.length} materials updated`);
      setSelectedMaterials([]);
      fetchMaterials();
    } catch (error) {
      console.error('Error updating materials:', error);
      toast.error('Failed to update materials');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedMaterials(materials.map(m => m._id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selectedMaterials.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedMaterials, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedMaterials.slice(1));
    } else if (selectedIndex === selectedMaterials.length - 1) {
      newSelected = newSelected.concat(selectedMaterials.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedMaterials.slice(0, selectedIndex),
        selectedMaterials.slice(selectedIndex + 1)
      );
    }

    setSelectedMaterials(newSelected);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Materials Management - Admin | MaterialPro</title>
      </Helmet>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Materials Management
          </Typography>
          <Stack direction="row" spacing={2}>
            {selectedMaterials.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedMaterials.length})
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBulkFeatured}
                >
                  Toggle Featured ({selectedMaterials.length})
                </Button>
              </>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Material
            </Button>
          </Stack>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedMaterials.length > 0 && selectedMaterials.length < materials.length}
                    checked={materials.length > 0 && selectedMaterials.length === materials.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price (₹)</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No materials yet. Click "Add Material" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => (
                  <TableRow key={material._id} selected={selectedMaterials.indexOf(material._id) !== -1}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedMaterials.indexOf(material._id) !== -1}
                        onChange={() => handleSelectOne(material._id)}
                      />
                    </TableCell>
                    <TableCell>{material.title}</TableCell>
                    <TableCell>{material.classLevel || 'N/A'}</TableCell>
                    <TableCell>{material.category}</TableCell>
                    <TableCell align="right">{material.priceINR}</TableCell>
                    <TableCell>{material.downloadCount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={material.isFeatured ? 'Yes' : 'No'}
                        color={material.isFeatured ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(material)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(material._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Title"
                  required
                  fullWidth
                  value={formData.title}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, title: e.target.value }));
                    if (formErrors.title) setFormErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
                <TextField
                  label="Description"
                  required
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Subject"
                      fullWidth
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subject: e.target.value }))
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Class Level"
                      fullWidth
                      value={formData.classLevel}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, classLevel: e.target.value }))
                      }
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                  >
                    {['Class', 'JEE', 'NEET', 'Foundation', 'Olympiad'].map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Price (₹)"
                  type="number"
                  fullWidth
                  value={formData.priceINR}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value) || 0);
                    setFormData((prev) => ({ ...prev, priceINR: value }));
                    if (formErrors.priceINR) setFormErrors((prev) => ({ ...prev, priceINR: '' }));
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!formErrors.priceINR}
                  helperText={formErrors.priceINR}
                />
                <TextField
                  label="Tags (comma separated)"
                  fullWidth
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="physics, maths, jee"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                      }
                    />
                  }
                  label="Featured"
                />
                <TextField
                  label="File (Any Format)"
                  type="file"
                  fullWidth
                  inputProps={{ accept: '*' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFileData((prev) => ({ ...prev, pdf: file }));
                    if (formErrors.pdf) setFormErrors((prev) => ({ ...prev, pdf: '' }));
                  }}
                  required={!editingMaterial}
                  error={!!formErrors.pdf}
                  helperText={formErrors.pdf || (editingMaterial ? 'Leave empty to keep current file' : 'Required - PDF, Word, Excel, or any document format')}
                />
                <TextField
                  label="Preview Image (Optional)"
                  type="file"
                  fullWidth
                  inputProps={{ accept: 'image/*' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFileData((prev) => ({ ...prev, previewImage: file }));
                    if (formErrors.previewImage) setFormErrors((prev) => ({ ...prev, previewImage: '' }));
                  }}
                  error={!!formErrors.previewImage}
                  helperText={formErrors.previewImage || (editingMaterial ? 'Leave empty to keep current preview' : 'Optional - Upload a preview image (will be resized automatically)')}
                />
                <TextField
                  label="Cover Image (Optional)"
                  type="file"
                  fullWidth
                  inputProps={{ accept: 'image/*' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFileData((prev) => ({ ...prev, coverImage: file }));
                    if (formErrors.coverImage) setFormErrors((prev) => ({ ...prev, coverImage: '' }));
                  }}
                  error={!!formErrors.coverImage}
                  helperText={formErrors.coverImage || (editingMaterial ? 'Leave empty to keep current image' : 'Optional, max 10MB')}
                />
                {editingMaterial && (
                  <TextField
                    label="Version Note (Optional)"
                    fullWidth
                    value={formData.versionNote}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, versionNote: e.target.value }))
                    }
                    placeholder="e.g., Updated with new problems, Fixed typos"
                    helperText="Add a note when uploading a new PDF version"
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingMaterial ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminMaterials;


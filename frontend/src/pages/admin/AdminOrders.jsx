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
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    email: '',
    page: 1,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters.page, filters.status, filters.email]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 50,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && key !== 'page')
        ),
      };
      const response = await api.get('/admin/orders', { params });
      if (response.success !== false) {
        setOrders(response.orders || []);
      } else {
        setOrders([]);
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      toast.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(
        `${baseUrl}/admin/orders/csv`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const handleRefundClick = (order) => {
    setSelectedOrder(order);
    setRefundAmount('');
    setRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    if (!selectedOrder) return;

    // Validate refund amount
    if (refundAmount) {
      const amount = Number(refundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Refund amount must be a positive number');
        return;
      }
      if (amount > selectedOrder.amountPaidINR) {
        toast.error('Refund amount cannot exceed the order amount');
        return;
      }
    }

    try {
      await api.post(`/admin/refund/${selectedOrder._id}`, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        manual: !refundAmount ? 'true' : 'false',
      });
      toast.success('Refund processed successfully');
      setRefundDialogOpen(false);
      setSelectedOrder(null);
      setRefundAmount('');
      fetchOrders();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Orders Management - Admin | MaterialPro</title>
      </Helmet>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Orders Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchOrders}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Filter by Email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="Enter email..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="captured">Captured</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell align="right">Amount (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.material?.title || 'N/A'}
                    </TableCell>
                    <TableCell>{order.buyerEmail}</TableCell>
                    <TableCell>{order.buyerMobile || 'N/A'}</TableCell>
                    <TableCell align="right">{order.amountPaidINR}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'captured'
                            ? 'success'
                            : order.status === 'refunded'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {order.razorpayPaymentId?.substring(0, 20)}...
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {order.status === 'captured' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleRefundClick(order)}
                        >
                          Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Refund Dialog */}
        <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)}>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Order ID: {selectedOrder?._id}
              <br />
              Amount Paid: ₹{selectedOrder?.amountPaidINR}
            </Alert>
            <TextField
              label="Refund Amount (₹)"
              type="number"
              fullWidth
              value={refundAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
                  setRefundAmount(value);
                }
              }}
              helperText={`Leave empty for full refund (Max: ₹${selectedOrder?.amountPaidINR || 0})`}
              inputProps={{ 
                min: 0, 
                max: selectedOrder?.amountPaidINR || 0,
                step: 0.01 
              }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRefund}
              variant="contained"
              color="error"
            >
              Process Refund
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AdminOrders;


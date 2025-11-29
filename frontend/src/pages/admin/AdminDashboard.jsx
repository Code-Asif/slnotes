import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/dashboard');
        if (response.success !== false && response.stats) {
          setStats(response.stats);
        } else {
          setStats(null);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <Typography>Failed to load dashboard stats</Typography>
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Materials', value: stats.totalMaterials, color: 'primary' },
    { title: 'Total Orders', value: stats.totalOrders, color: 'success' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'secondary' },
    { title: "Today's Sales", value: stats.todayOrders, color: 'info' },
    { title: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, color: 'warning' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin | MaterialPro</title>
      </Helmet>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" component="div" color={`${card.color}.main`} fontWeight="bold">
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Revenue Trend (Last 7 Days)
                </Typography>
                {stats.revenueTrend7Days && stats.revenueTrend7Days.length > 0 ? (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <LineChart
                      xAxis={[{
                        data: stats.revenueTrend7Days.map(item => item._id),
                        scaleType: 'point',
                      }]}
                      series={[{
                        data: stats.revenueTrend7Days.map(item => item.revenue || 0),
                        label: 'Revenue (₹)',
                        color: '#1976d2',
                      }]}
                      width={undefined}
                      height={300}
                    />
                  </Box>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Orders Trend (Last 7 Days)
                </Typography>
                {stats.ordersTrend7Days && stats.ordersTrend7Days.length > 0 ? (
                  <Box sx={{ width: '100%', height: 300 }}>
                    <BarChart
                      xAxis={[{
                        data: stats.ordersTrend7Days.map(item => item._id),
                        scaleType: 'band',
                      }]}
                      series={[{
                        data: stats.ordersTrend7Days.map(item => item.count || 0),
                        label: 'Orders',
                        color: '#9c27b0',
                      }]}
                      width={undefined}
                      height={300}
                    />
                  </Box>
                ) : (
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Materials */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Top Materials by Downloads
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Material</TableCell>
                        <TableCell align="right">Downloads</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.topMaterials && stats.topMaterials.length > 0 ? (
                        stats.topMaterials.map((material) => (
                          <TableRow key={material._id}>
                            <TableCell>{material.title}</TableCell>
                            <TableCell align="right">{material.downloadCount || 0}</TableCell>
                            <TableCell align="right">₹{material.priceINR || 0}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No materials yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Recent Orders
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Material</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentOrders && stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>
                              {order.material?.title || 'N/A'}
                            </TableCell>
                            <TableCell>{order.buyerEmail}</TableCell>
                            <TableCell align="right">₹{order.amountPaidINR}</TableCell>
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
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No orders yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Pagination,
  Button,
} from '@mui/material';
import {
  Storage,
  TrendingUp,
  Visibility,
  ThumbUp,
  Comment,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

interface DatasetStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  countries: number;
  categories: number;
  dateRange: {
    from: string;
    to: string;
  } | null;
}

interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  trendingScore: number;
  engagementRate: number;
  categoryId: string;
  countryCode?: string;
}

const Dataset: React.FC = () => {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('trendingScore');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchCountries();
    fetchCategories();
    fetchTimeline();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedCountry, selectedCategory, searchQuery, sortBy, page]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dataset/stats');
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
        setError(null);
      } else {
        setError('Backend is not running. Please start the backend server.');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch dataset stats. Make sure backend is running on http://localhost:5000';
      setError(errorMsg);
      console.error('Error fetching stats:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
        sortBy,
        order: 'desc'
      };
      if (selectedCountry) params.countryCode = selectedCountry;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get('/dataset/videos', { params });
      if (response.data && response.data.data) {
        setVideos(response.data.data);
        setTotalPages(response.data.pagination?.pages || 1);
        setError(null);
      } else {
        setError('No data received from backend');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch videos. Make sure backend is running.';
      setError(errorMsg);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await api.get('/dataset/countries');
      setCountries(response.data?.countries || []);
    } catch (err) {
      console.error('Failed to fetch countries:', err);
      setCountries([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/dataset/categories');
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchTimeline = async () => {
    try {
      const params: any = { groupBy: 'month' };
      if (selectedCountry) params.countryCode = selectedCountry;
      const response = await api.get('/dataset/timeline', { params });
      setTimeline(response.data?.timeline || []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      setTimeline([]);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading && !stats) {
    return (
      <Container maxWidth="xl">
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dataset...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Kaggle Dataset Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Storage color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Videos</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {stats.totalVideos.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Visibility color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Views</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(stats.totalViews)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThumbUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Likes</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(stats.totalLikes)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Comment color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Comments</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatNumber(stats.totalComments)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search videos..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  label="Country"
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {(countries || []).map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.code} ({country.count.toLocaleString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {(categories || []).map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      Category {cat._id} ({cat.count.toLocaleString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  label="Sort By"
                >
                  <MenuItem value="trendingScore">Trending Score</MenuItem>
                  <MenuItem value="views">Views</MenuItem>
                  <MenuItem value="publishedAt">Published Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Videos Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Categories
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(categories || []).slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Videos Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Videos from Dataset
          </Typography>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Channel</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Views</TableCell>
                      <TableCell align="right">Likes</TableCell>
                      <TableCell align="right">Comments</TableCell>
                      <TableCell align="right">Trending Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!videos || videos.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          {loading ? 'Loading...' : 'No videos found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      (videos || []).map((video) => (
                        <TableRow key={video.videoId}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {video.title}
                            </Typography>
                          </TableCell>
                          <TableCell>{video.channelTitle}</TableCell>
                          <TableCell>
                            <Chip label={video.countryCode || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            {video.statistics.viewCount.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {video.statistics.likeCount.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {video.statistics.commentCount.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {video.trendingScore.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dataset;


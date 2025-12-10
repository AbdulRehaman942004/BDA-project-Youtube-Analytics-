// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  ThumbUp,
  Comment,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';
import { getCategoryName } from '../utils/categoryMapper';
import frontendCache from '../utils/cache';

interface DashboardData {
  overview: {
    totalVideos: number;
    totalViews: number;
    timeRange: string;
  };
  topVideos: any[];
  categoryStats: any[];
  engagementStats: {
    avgEngagement: number;
    maxEngagement: number;
    minEngagement: number;
  };
  trendingKeywords: any[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/analytics/dashboard?timeRange=7d');
      if (response.data && response.data.data) {
        setData(response.data.data);
        if (response.data.cached || (response as any).fromCache) {
          console.log('✅ Using cached response');
        }
      } else {
        setError('No data received from backend. Make sure backend is running and dataset is imported.');
      }
    } catch (err: any) {
      // Handle cached responses
      if (err && err.__cached) {
        if (err.data && err.data.data) {
          setData(err.data.data);
          console.log('✅ Using cached data');
          return;
        }
      }
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch dashboard data';
      setError(`Failed to fetch dashboard data: ${errorMsg}. Make sure backend is running on http://localhost:5000`);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning">
          No data available
        </Alert>
      </Container>
    );
  }

  const chartData = data.categoryStats.map((category, index) => ({
    category: category.name || getCategoryName(category.id || category._id),
    videos: category.count,
  }));

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        YouTube Trends Overview
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Visibility color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Views
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.overview.totalViews.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last {data.overview.timeRange}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="secondary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Videos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.overview.totalVideos.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzed videos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ThumbUp color="success" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Avg Engagement
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {data.engagementStats.avgEngagement.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Like + Comment rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="videos" fill="#ff0000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Trending Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {data.trendingKeywords
                  .filter((keyword: any) => {
                    const kw = keyword.keyword || '';
                    return kw && 
                           kw.trim() !== '' && 
                           !kw.match(/^\[none\]$/i) && 
                           kw.toLowerCase() !== 'none' &&
                           kw.toLowerCase() !== 'null' &&
                           kw.toLowerCase() !== 'undefined';
                  })
                  .slice(0, 20)
                  .map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword.keyword}
                      color="primary"
                      size="small"
                    />
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Videos */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Top Trending Videos
              </Typography>
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {data.topVideos.slice(0, 10).map((video, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {video.channelTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        👀 {video.statistics?.viewCount?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        👍 {video.statistics?.likeCount?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        💬 {video.statistics?.commentCount?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

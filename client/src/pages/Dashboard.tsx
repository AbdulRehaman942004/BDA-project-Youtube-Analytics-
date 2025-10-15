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
  Subscriptions,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

interface DashboardData {
  overview: {
    totalVideos: number;
    totalViews: number;
    timeRange: string;
  };
  topVideos: any[];
  topChannels: any[];
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
      const response = await api.get('/analytics/dashboard?timeRange=7d');
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
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
    category: `Category ${category._id}`,
    videos: category.count,
  }));

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Visibility color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Views</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.overview.totalViews.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last {data.overview.timeRange}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Videos</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.overview.totalVideos.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzed videos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ThumbUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Avg Engagement</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.engagementStats.avgEngagement.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Like + Comment rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Subscriptions color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Top Channels</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.topChannels.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trending channels
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="videos" fill="#ff0000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trending Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {data.trendingKeywords.slice(0, 10).map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword.keyword}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Videos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Trending Videos
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {data.topVideos.slice(0, 5).map((video, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {video.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.channelTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption">
                        👀 {video.statistics.viewCount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption">
                        👍 {video.statistics.likeCount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption">
                        💬 {video.statistics.commentCount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Channels
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {data.topChannels.slice(0, 5).map((channel, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle2">
                      {channel.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trending Videos: {channel.trendingVideosCount}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Subscribers: {channel.statistics.subscriberCount.toLocaleString()}
                    </Typography>
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

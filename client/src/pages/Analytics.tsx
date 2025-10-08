import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { TrendingUp, Channel, VideoLibrary, Insights } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/analytics/dashboard?timeRange=30d');
      setAnalyticsData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const COLORS = ['#ff0000', '#1976d2', '#388e3c', '#f57c00', '#7b1fa2'];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics...
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

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Analytics Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab icon={<Insights />} label="Overview" />
          <Tab icon={<TrendingUp />} label="Trends" />
          <Tab icon={<Channel />} label="Channels" />
          <Tab icon={<VideoLibrary />} label="Categories" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {analyticsData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Engagement Statistics
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Likes', value: analyticsData.engagementStats.maxEngagement },
                          { name: 'Comments', value: analyticsData.engagementStats.avgEngagement },
                          { name: 'Views', value: 100 - analyticsData.engagementStats.avgEngagement },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Category Distribution
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {analyticsData.categoryStats.map((category: any, index: number) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                        <Typography variant="subtitle2">
                          Category {category._id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.count} videos
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Trending Keywords
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analyticsData?.trendingKeywords.map((keyword: any, index: number) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        minWidth: 200,
                      }}
                    >
                      <Typography variant="subtitle2">{keyword.keyword}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {keyword.category}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Score: {keyword.trendScore}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performing Channels
                </Typography>
                <Grid container spacing={2}>
                  {analyticsData?.topChannels.map((channel: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, height: '100%' }}>
                        <Typography variant="subtitle2">{channel.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Trending Videos: {channel.trendingVideosCount}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Subscribers: {channel.statistics.subscriberCount?.toLocaleString() || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData?.categoryStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#ff0000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default Analytics;

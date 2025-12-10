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
import { TrendingUp, VideoLibrary, Insights } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { getCategoryName } from '../utils/categoryMapper';
import frontendCache from '../utils/cache';

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
      if (response.data && response.data.data) {
        setAnalyticsData(response.data.data);
        if (response.data.cached || (response as any).fromCache) {
          console.log('✅ Using cached response');
        }
      }
    } catch (err: any) {
      // Handle cached responses
      if (err && err.__cached) {
        if (err.data && err.data.data) {
          setAnalyticsData(err.data.data);
          console.log('✅ Using cached data');
          return;
        }
      }
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
                    Engagement Rate Statistics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Average Engagement: {analyticsData.engagementStats.avgEngagement.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Max Engagement: {analyticsData.engagementStats.maxEngagement.toFixed(2)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Min Engagement: {analyticsData.engagementStats.minEngagement.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Engagement Rate = (Likes + Comments) / Views × 100
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { 
                            name: 'Engaged', 
                            value: analyticsData.engagementStats.avgEngagement,
                            label: `${analyticsData.engagementStats.avgEngagement.toFixed(1)}% Engaged`
                          },
                          { 
                            name: 'Not Engaged', 
                            value: 100 - analyticsData.engagementStats.avgEngagement,
                            label: `${(100 - analyticsData.engagementStats.avgEngagement).toFixed(1)}% Not Engaged`
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'Engagement Rate']}
                      />
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
                          {category.name || getCategoryName(category.id || category._id)}
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
                  {analyticsData?.trendingKeywords
                    .filter((keyword: any) => {
                      const kw = keyword.keyword || '';
                      return kw && 
                             kw.trim() !== '' && 
                             !kw.match(/^\[none\]$/i) && 
                             kw.toLowerCase() !== 'none' &&
                             kw.toLowerCase() !== 'null' &&
                             kw.toLowerCase() !== 'undefined';
                    })
                    .map((keyword: any, index: number) => (
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
                  Category Performance
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={(analyticsData?.categoryStats || []).map((cat: any) => ({
                      ...cat,
                      categoryName: cat.name || getCategoryName(cat.id || cat._id)
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="categoryName" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Videos']}
                      labelFormatter={(label: any) => `Category: ${label}`}
                    />
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

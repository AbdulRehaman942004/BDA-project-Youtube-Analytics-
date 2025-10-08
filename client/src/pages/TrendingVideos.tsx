import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Button,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ThumbUp, Comment, Visibility, Refresh } from '@mui/icons-material';
import api from '../services/api';

interface Video {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    medium: string;
    high: string;
  };
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  trendingScore: number;
  engagementRate: number;
}

const TrendingVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('US');
  const [maxResults, setMaxResults] = useState(25);

  useEffect(() => {
    fetchTrendingVideos();
  }, [region, maxResults]);

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/youtube/trending', {
        params: { regionCode: region, maxResults }
      });
      
      setVideos(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch trending videos');
      console.error('Error fetching trending videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Trending Videos
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={region}
              label="Region"
              onChange={(e) => setRegion(e.target.value)}
            >
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="GB">United Kingdom</MenuItem>
              <MenuItem value="CA">Canada</MenuItem>
              <MenuItem value="AU">Australia</MenuItem>
              <MenuItem value="DE">Germany</MenuItem>
              <MenuItem value="FR">France</MenuItem>
              <MenuItem value="IN">India</MenuItem>
              <MenuItem value="BR">Brazil</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Results</InputLabel>
            <Select
              value={maxResults}
              label="Results"
              onChange={(e) => setMaxResults(Number(e.target.value))}
            >
              <MenuItem value={10}>10 videos</MenuItem>
              <MenuItem value={25}>25 videos</MenuItem>
              <MenuItem value={50}>50 videos</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={fetchTrendingVideos}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {videos.map((video, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video.videoId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={video.thumbnails.medium || video.thumbnails.high}
                alt={video.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {video.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {video.channelTitle}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<Visibility />}
                    label={formatNumber(video.statistics.viewCount)}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={<ThumbUp />}
                    label={formatNumber(video.statistics.likeCount)}
                    size="small"
                    color="secondary"
                  />
                  <Chip
                    icon={<Comment />}
                    label={formatNumber(video.statistics.commentCount)}
                    size="small"
                    color="info"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(video.publishedAt)}
                  </Typography>
                  
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block">
                      Score: {Math.round(video.trendingScore).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Engagement: {video.engagementRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {videos.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No trending videos found
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchTrendingVideos}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default TrendingVideos;

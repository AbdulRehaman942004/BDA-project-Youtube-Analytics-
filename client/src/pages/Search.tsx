import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon, Visibility, ThumbUp, Comment } from '@mui/icons-material';
import api from '../services/api';

interface SearchResult {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    medium: string;
    high: string;
  };
  categoryId: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState(25);
  const [order, setOrder] = useState('relevance');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/youtube/search', {
        params: {
          q: query,
          maxResults,
          order
        }
      });
      
      setResults(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search videos');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Search YouTube Videos
      </Typography>

      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search for videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords, topics, or channel names"
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={order}
                label="Order"
                onChange={(e) => setOrder(e.target.value)}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="viewCount">View Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
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
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Found {results.length} video{results.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {results.map((video, index) => (
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
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {video.channelTitle}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {video.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(video.publishedAt)}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    Category: {video.categoryId}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {results.length === 0 && !loading && !error && query && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No videos found for "{query}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try different keywords or search terms
          </Typography>
        </Box>
      )}

      {!query && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Search for YouTube videos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter keywords to find trending videos, channels, or topics
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Search;

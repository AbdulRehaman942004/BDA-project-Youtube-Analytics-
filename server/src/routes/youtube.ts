import { Router, Request, Response } from 'express';
import axios from 'axios';
import Video from '../models/Video';
import Channel from '../models/Channel';

const router = Router();

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Get trending videos
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { regionCode = 'US', maxResults = 50, categoryId } = req.query;

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'YouTube API key not configured'
      });
    }

    // Fetch from YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode,
        maxResults: parseInt(maxResults as string),
        ...(categoryId && { videoCategoryId: categoryId }),
        key: YOUTUBE_API_KEY
      }
    });

    const videos = response.data.items.map((item: any) => ({
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      statistics: {
        viewCount: parseInt(item.statistics.viewCount || '0'),
        likeCount: parseInt(item.statistics.likeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0')
      },
      categoryId: item.snippet.categoryId,
      duration: item.contentDetails.duration,
      trendingScore: calculateTrendingScore(item.statistics),
      engagementRate: calculateEngagementRate(item.statistics)
    }));

    // Save to database
    for (const video of videos) {
      await Video.findOneAndUpdate(
        { videoId: video.videoId },
        video,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });

  } catch (error) {
    console.error('Error fetching trending videos:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trending videos'
    });
  }
});

// Search videos
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, maxResults = 25, order = 'relevance' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'YouTube API key not configured'
      });
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: q as string,
        type: 'video',
        maxResults: parseInt(maxResults as string),
        order: order as string,
        key: YOUTUBE_API_KEY
      }
    });

    const videos = response.data.items.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      categoryId: item.snippet.categoryId
    }));

    res.json({
      success: true,
      count: videos.length,
      data: videos
    });

  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search videos'
    });
  }
});

// Get video details
router.get('/video/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    // First try to get from database
    let video = await Video.findOne({ videoId });

    if (!video && YOUTUBE_API_KEY) {
      // Fetch from YouTube API if not in database
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: YOUTUBE_API_KEY
        }
      });

      if (response.data.items.length > 0) {
        const item = response.data.items[0];
        video = new Video({
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnails: item.snippet.thumbnails,
          statistics: {
            viewCount: parseInt(item.statistics.viewCount || '0'),
            likeCount: parseInt(item.statistics.likeCount || '0'),
            commentCount: parseInt(item.statistics.commentCount || '0')
          },
          categoryId: item.snippet.categoryId,
          duration: item.contentDetails.duration,
          trendingScore: calculateTrendingScore(item.statistics),
          engagementRate: calculateEngagementRate(item.statistics)
        });

        await video.save();
      }
    }

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch video'
    });
  }
});

// Helper functions
function calculateTrendingScore(statistics: any): number {
  const views = parseInt(statistics.viewCount || '0');
  const likes = parseInt(statistics.likeCount || '0');
  const comments = parseInt(statistics.commentCount || '0');
  
  // Simple trending score calculation
  return views * 0.1 + likes * 2 + comments * 5;
}

function calculateEngagementRate(statistics: any): number {
  const views = parseInt(statistics.viewCount || '0');
  const likes = parseInt(statistics.likeCount || '0');
  const comments = parseInt(statistics.commentCount || '0');
  
  if (views === 0) return 0;
  
  return ((likes + comments) / views) * 100;
}

export default router;

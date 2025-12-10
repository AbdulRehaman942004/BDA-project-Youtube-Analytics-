import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import Channel from '../models/Channel';

const router = Router();


// Get trending videos from dataset
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { regionCode, maxResults = 50, categoryId } = req.query;

    // Build query from dataset
    const query: any = {};
    if (regionCode) {
      query.countryCode = regionCode;
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Fetch trending videos from MongoDB dataset, sorted by trendingScore
    // Use lean() for better performance and ensure trendingScore exists
    const videos = await Video.find(query)
      .sort({ trendingScore: -1 })
      .limit(parseInt(maxResults as string))
      .select('videoId title description channelTitle channelId publishedAt thumbnails statistics trendingScore engagementRate categoryId countryCode')
      .lean()
      .exec();

    // If no videos found, return empty array instead of error
    if (!videos || videos.length === 0) {
      console.log(`No trending videos found for query:`, query);
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Format videos to match expected structure
    const formattedVideos = videos.map((video: any) => ({
      videoId: video.videoId || '',
      title: video.title || 'Untitled',
      description: video.description || '',
      channelId: video.channelId || '',
      channelTitle: video.channelTitle || 'Unknown Channel',
      publishedAt: video.publishedAt || new Date(),
      thumbnails: video.thumbnails || {
        medium: { url: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg` },
        high: { url: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` }
      },
      statistics: video.statistics || {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      },
      categoryId: video.categoryId || '',
      trendingScore: video.trendingScore || 0,
      engagementRate: video.engagementRate || 0
    }));

    console.log(`✅ Returning ${formattedVideos.length} trending videos`);

    return res.json({
      success: true,
      count: formattedVideos.length,
      data: formattedVideos
    });

  } catch (error) {
    console.error('❌ Error fetching trending videos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trending videos';
    console.error('Error details:', error);
    return res.status(500).json({
      success: false,
      error: errorMessage,
      message: 'Failed to fetch trending videos from database'
    });
  }
});

// Search videos in dataset
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, maxResults = 25, order = 'relevance' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Build search query for MongoDB
    const searchQuery: any = {
      $or: [
        { title: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
        { channelTitle: { $regex: q as string, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } }
      ]
    };

    // Build sort options
    let sortOptions: any = {};
    switch (order) {
      case 'date':
        sortOptions = { publishedAt: -1 };
        break;
      case 'rating':
        sortOptions = { 'statistics.likeCount': -1 };
        break;
      case 'viewCount':
        sortOptions = { 'statistics.viewCount': -1 };
        break;
      case 'relevance':
      default:
        // Sort by trending score for relevance
        sortOptions = { trendingScore: -1 };
        break;
    }

    // Search in MongoDB dataset
    const videos = await Video.find(searchQuery)
      .sort(sortOptions)
      .limit(parseInt(maxResults as string))
      .select('videoId title description channelTitle channelId publishedAt thumbnails categoryId statistics trendingScore engagementRate')
      .lean();

    // Format videos
    const formattedVideos = videos.map((video: any) => ({
      videoId: video.videoId,
      title: video.title,
      description: video.description || '',
      channelId: video.channelId,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      thumbnails: video.thumbnails || {
        medium: { url: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg` },
        high: { url: `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg` }
      },
      categoryId: video.categoryId,
      statistics: video.statistics || {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0
      },
      trendingScore: video.trendingScore || 0,
      engagementRate: video.engagementRate || 0
    }));

    return res.json({
      success: true,
      count: formattedVideos.length,
      data: formattedVideos
    });

  } catch (error) {
    console.error('Error searching videos:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search videos'
    });
  }
});

// Get video details
router.get('/video/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    // Get video from database
    const video = await Video.findOne({ videoId });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    return res.json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({
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

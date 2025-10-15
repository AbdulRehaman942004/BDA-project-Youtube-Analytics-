import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import Channel from '../models/Channel';
import Trend from '../models/Trend';

const router = Router();

// Get analytics dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get aggregated data
    const [
      totalVideos,
      totalViews,
      topVideos,
      topChannels,
      categoryStats,
      engagementStats,
      trendingKeywords
    ] = await Promise.all([
      Video.countDocuments({ publishedAt: { $gte: startDate } }),
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        { $group: { _id: null, totalViews: { $sum: '$statistics.viewCount' } } }
      ]),
      Video.find({ publishedAt: { $gte: startDate } })
        .sort({ trendingScore: -1 })
        .limit(10)
        .select('videoId title channelTitle statistics trendingScore publishedAt'),
      Channel.find()
        .sort({ trendingVideosCount: -1 })
        .limit(10)
        .select('channelId title statistics trendingVideosCount'),
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgEngagement: { $avg: '$engagementRate' },
            maxEngagement: { $max: '$engagementRate' },
            minEngagement: { $min: '$engagementRate' }
          }
        }
      ]),
      Trend.find({ status: 'active' })
        .sort({ trendScore: -1 })
        .limit(10)
        .select('keyword category trendScore startDate')
    ]);

    return res.json({
      success: true,
      data: {
        overview: {
          totalVideos,
          totalViews: totalViews[0]?.totalViews || 0,
          timeRange
        },
        topVideos,
        topChannels,
        categoryStats,
        engagementStats: engagementStats[0] || {
          avgEngagement: 0,
          maxEngagement: 0,
          minEngagement: 0
        },
        trendingKeywords
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    });
  }
});

// Get trend analysis
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const { category, limit = 50 } = req.query;
    
    const query: any = {};
    if (category) {
      query.category = String(category);
    }

    const trends = await Trend.find(query)
      .sort({ trendScore: -1 })
      .limit(parseInt(String(limit)))
      .populate('relatedVideos', 'title channelTitle statistics')
      .populate('relatedChannels', 'title statistics');

    res.json({
      success: true,
      count: trends.length,
      data: trends
    });

  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trends'
    });
  }
});

// Get channel analytics
router.get('/channels/:channelId', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [channel, videos, analytics] = await Promise.all([
      Channel.findOne({ channelId }),
      Video.find({ 
        channelId, 
        publishedAt: { $gte: startDate } 
      }).sort({ publishedAt: -1 }),
      Video.aggregate([
        { $match: { channelId, publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$statistics.viewCount' },
            totalLikes: { $sum: '$statistics.likeCount' },
            totalComments: { $sum: '$statistics.commentCount' },
            avgEngagement: { $avg: '$engagementRate' },
            videoCount: { $sum: 1 }
          }
        }
      ])
    ]);

    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }

    return res.json({
      success: true,
      data: {
        channel,
        videos,
        analytics: analytics[0] || {
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          avgEngagement: 0,
          videoCount: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching channel analytics:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch channel analytics'
    });
  }
});

// Get video performance over time
router.get('/performance/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    const video = await Video.findOne({ videoId });
    
    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // In a real implementation, you would track historical data
    // For now, we'll return current statistics
    return res.json({
      success: true,
      data: {
        videoId: video.videoId,
        title: video.title,
        currentStats: video.statistics,
        engagementRate: video.engagementRate,
        trendingScore: video.trendingScore,
        publishedAt: video.publishedAt
      }
    });

  } catch (error) {
    console.error('Error fetching video performance:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch video performance'
    });
  }
});

export default router;

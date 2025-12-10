import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import Channel from '../models/Channel';
import Trend from '../models/Trend';
import { enrichCategoryStats } from '../utils/categoryMapper';
import cache from '../utils/cache';

const router = Router();

// Get analytics dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Create cache key based on timeRange
    const cacheKey = `dashboard:${timeRange}`;
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache hit for ${cacheKey}`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    console.log(`⏳ Cache miss for ${cacheKey}, fetching from database...`);
    
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

    // Check if we have any videos in the date range, if not, use all data
    const videosInRange = await Video.countDocuments({ publishedAt: { $gte: startDate } });
    const useAllData = videosInRange === 0;
    
    const dateFilter = useAllData ? {} : { publishedAt: { $gte: startDate } };

    // Optimized: Use $facet to run multiple aggregations in a single pipeline
    // This is more efficient than multiple separate queries
    const aggregationResults = await Video.aggregate([
      { $match: dateFilter },
      {
        $facet: {
          // Total videos count
          totalVideos: [{ $count: 'count' }],
          // Total views
          totalViews: [
            { $group: { _id: null, total: { $sum: { $ifNull: ['$statistics.viewCount', 0] } } } }
          ],
          // Top videos (limit early for better performance)
          topVideos: [
            { $sort: { trendingScore: -1 } },
            { $limit: 15 },
            {
              $project: {
                videoId: 1,
                title: 1,
                channelTitle: 1,
                statistics: 1,
                trendingScore: 1,
                publishedAt: 1
              }
            }
          ],
          // Category stats
          categoryStats: [
            { $group: { _id: '$categoryId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          // Engagement stats
          engagementStats: [
            {
              $group: {
                _id: null,
                avgEngagement: { $avg: { $ifNull: ['$engagementRate', 0] } },
                maxEngagement: { $max: { $ifNull: ['$engagementRate', 0] } },
                minEngagement: { $min: { $ifNull: ['$engagementRate', 0] } }
              }
            }
          ]
        }
      }
    ], { allowDiskUse: true }); // Allow disk use for large aggregations

    // Extract results from facet
    const facetResults = aggregationResults[0] || {};
    const totalVideos = facetResults.totalVideos?.[0]?.count || 0;
    const totalViews = facetResults.totalViews?.[0]?.total || 0;
    const topVideos = facetResults.topVideos || [];
    const rawCategoryStats = facetResults.categoryStats || [];
    // Enrich category stats with names
    const categoryStats = enrichCategoryStats(rawCategoryStats);
    const engagementStats = facetResults.engagementStats?.[0] || {
      avgEngagement: 0,
      maxEngagement: 0,
      minEngagement: 0
    };

    // Get trending keywords from Trend collection, or fallback to video tags
    let trendingKeywords: any[] = [];
    const trends = await Trend.find({ status: 'active' })
      .sort({ trendScore: -1 })
      .limit(25)
      .select('keyword category trendScore startDate')
      .lean();
    
    if (trends.length > 0) {
      trendingKeywords = trends;
    } else {
      // Optimized: Get trending keywords from video tags
      // Limit early and use allowDiskUse for better performance
      const tagStats = await Video.aggregate([
        { $match: dateFilter },
        { $project: { tags: 1 } }, // Only project tags field
        { $limit: 50000 }, // Limit before unwinding to reduce memory
        { $unwind: '$tags' },
        { 
          $match: { 
            tags: { 
              $exists: true, 
              $nin: [null, '', '[none]', 'none', 'None', 'NONE', 'null', 'undefined'],
              $not: /^\[none\]$/i // Case-insensitive regex for [none] variations
            } 
          } 
        }, // Filter empty tags and placeholder values
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
        { $project: { keyword: '$_id', trendScore: '$count', _id: 0 } }
      ], { allowDiskUse: true }); // Allow disk use for large tag operations
      
      trendingKeywords = tagStats
        .filter((tag: any) => {
          const keyword = tag.keyword || '';
          // Additional filtering for invalid keywords
          return keyword && 
                 keyword.trim() !== '' && 
                 !keyword.match(/^\[none\]$/i) && 
                 keyword.toLowerCase() !== 'none' &&
                 keyword.toLowerCase() !== 'null' &&
                 keyword.toLowerCase() !== 'undefined';
        })
        .map((tag: any) => ({
          keyword: tag.keyword || 'Unknown',
          trendScore: tag.trendScore || tag.count || 0,
          category: 'General'
        }));
    }

    // Prepare response data
    const responseData = {
      overview: {
        totalVideos,
        totalViews: totalViews || 0, // totalViews is already extracted as a number
        timeRange
      },
      topVideos,
      categoryStats,
      engagementStats: engagementStats || {
        avgEngagement: 0,
        maxEngagement: 0,
        minEngagement: 0
      },
      trendingKeywords
    };

    // Cache the response
    // Use longer TTL for longer time ranges (data changes less frequently)
    const ttl = timeRange === '1d' ? 2 * 60 * 1000 : // 2 minutes for 1 day
                timeRange === '7d' ? 5 * 60 * 1000 : // 5 minutes for 7 days
                timeRange === '30d' ? 10 * 60 * 1000 : // 10 minutes for 30 days
                15 * 60 * 1000; // 15 minutes for 90 days
    
    cache.set(cacheKey, responseData, ttl);
    console.log(`✅ Cached ${cacheKey} for ${ttl / 1000 / 60} minutes`);

    return res.json({
      success: true,
      data: responseData,
      cached: false
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

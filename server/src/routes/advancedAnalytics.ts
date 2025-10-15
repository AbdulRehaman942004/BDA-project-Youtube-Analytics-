import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import Channel from '../models/Channel';
import Trend from '../models/Trend';
import { StatisticalAnalyzer } from '../services/statisticalAnalysis';
import moment from 'moment';
import _ from 'lodash';

const router = Router();

// Enhanced dashboard with statistical analysis
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { timeRange = '7d', includeStats = 'true' } = req.query;
    
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
      trendingKeywords,
      videosForAnalysis
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
        .select('keyword category trendScore startDate'),
      Video.find({ publishedAt: { $gte: startDate } })
        .select('statistics trendingScore engagementRate publishedAt')
        .sort({ publishedAt: 1 })
    ]);

    let statisticalAnalysis = null;
    if (includeStats === 'true' && videosForAnalysis.length > 0) {
      // Extract metrics for statistical analysis
      const viewCounts = videosForAnalysis.map(v => v.statistics.viewCount);
      const likeCounts = videosForAnalysis.map(v => v.statistics.likeCount);
      const commentCounts = videosForAnalysis.map(v => v.statistics.commentCount);
      const engagementRates = videosForAnalysis.map(v => v.engagementRate);
      const trendingScores = videosForAnalysis.map(v => v.trendingScore);

      // Calculate statistical metrics
      const viewStats = StatisticalAnalyzer.calculateMetrics(viewCounts);
      const likeStats = StatisticalAnalyzer.calculateMetrics(likeCounts);
      const commentStats = StatisticalAnalyzer.calculateMetrics(commentCounts);
      const engagementStats = StatisticalAnalyzer.calculateMetrics(engagementRates);
      const trendingStats = StatisticalAnalyzer.calculateMetrics(trendingScores);

      // Calculate correlations
      const viewLikeCorrelation = StatisticalAnalyzer.calculateCorrelation(viewCounts, likeCounts);
      const viewCommentCorrelation = StatisticalAnalyzer.calculateCorrelation(viewCounts, commentCounts);
      const likeCommentCorrelation = StatisticalAnalyzer.calculateCorrelation(likeCounts, commentCounts);

      // Calculate trend analysis for engagement over time
      const timeSeriesData = videosForAnalysis.map((v, index) => ({
        x: index,
        y: v.engagementRate
      }));
      const engagementTrend = StatisticalAnalyzer.analyzeTrend(timeSeriesData);

      statisticalAnalysis = {
        metrics: {
          views: viewStats,
          likes: likeStats,
          comments: commentStats,
          engagement: engagementStats,
          trending: trendingStats
        },
        correlations: {
          viewLike: viewLikeCorrelation,
          viewComment: viewCommentCorrelation,
          likeComment: likeCommentCorrelation
        },
        trends: {
          engagement: engagementTrend
        }
      };
    }

    res.json({
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
        trendingKeywords,
        statisticalAnalysis
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    });
  }
});

// Advanced comparative analysis
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { 
      channels, 
      videos, 
      metrics = 'views,likes,comments,engagement',
      timeRange = '30d' 
    } = req.query;

    if (!channels && !videos) {
      return res.status(400).json({
        success: false,
        error: 'Either channels or videos parameter is required'
      });
    }

    const metricsList = (metrics as string).split(',');
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

    let comparisonData: any = {};

    if (channels) {
      const channelIds = (channels as string).split(',');
      const channelData = await Promise.all(
        channelIds.map(async (channelId) => {
          const [channel, videos] = await Promise.all([
            Channel.findOne({ channelId }),
            Video.find({ 
              channelId, 
              publishedAt: { $gte: startDate } 
            }).select('statistics engagementRate trendingScore publishedAt')
          ]);

          if (!channel) return null;

          const analytics = videos.length > 0 ? Video.aggregate([
            { $match: { channelId, publishedAt: { $gte: startDate } } },
            {
              $group: {
                _id: null,
                totalViews: { $sum: '$statistics.viewCount' },
                totalLikes: { $sum: '$statistics.likeCount' },
                totalComments: { $sum: '$statistics.commentCount' },
                avgEngagement: { $avg: '$engagementRate' },
                avgTrendingScore: { $avg: '$trendingScore' },
                videoCount: { $sum: 1 }
              }
            }
          ]) : [];

          const analyticsResult = await analytics;

          return {
            channelId: channel.channelId,
            title: channel.title,
            subscriberCount: channel.statistics?.subscriberCount || 0,
            videoCount: videos.length,
            metrics: analyticsResult[0] || {
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
              avgEngagement: 0,
              avgTrendingScore: 0,
              videoCount: 0
            },
            videos: videos.slice(0, 5) // Top 5 videos for detailed analysis
          };
        })
      );

      comparisonData.channels = channelData.filter(Boolean);
    }

    if (videos) {
      const videoIds = (videos as string).split(',');
      const videoData = await Promise.all(
        videoIds.map(async (videoId) => {
          const video = await Video.findOne({ videoId });
          if (!video) return null;

          return {
            videoId: video.videoId,
            title: video.title,
            channelTitle: video.channelTitle,
            publishedAt: video.publishedAt,
            statistics: video.statistics,
            engagementRate: video.engagementRate,
            trendingScore: video.trendingScore,
            categoryId: video.categoryId
          };
        })
      );

      comparisonData.videos = videoData.filter(Boolean);
    }

    // Calculate comparative statistics
    if (comparisonData.channels) {
      const channelMetrics = comparisonData.channels.map((c: any) => c.metrics);
      const totalViews = channelMetrics.map((m: any) => m.totalViews);
      const totalLikes = channelMetrics.map((m: any) => m.totalLikes);
      const avgEngagements = channelMetrics.map((m: any) => m.avgEngagement);

      comparisonData.statistics = {
        views: StatisticalAnalyzer.calculateMetrics(totalViews),
        likes: StatisticalAnalyzer.calculateMetrics(totalLikes),
        engagement: StatisticalAnalyzer.calculateMetrics(avgEngagements)
      };
    }

    res.json({
      success: true,
      data: comparisonData
    });

  } catch (error) {
    console.error('Error in comparative analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform comparative analysis'
    });
  }
});

// Historical trend analysis
router.get('/trends/historical', async (req: Request, res: Response) => {
  try {
    const { 
      channelId, 
      categoryId, 
      metric = 'views',
      period = 'daily',
      limit = 30 
    } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(limit as string) * 24 * 60 * 60 * 1000));

    let matchQuery: any = { publishedAt: { $gte: startDate } };
    if (channelId) matchQuery.channelId = channelId;
    if (categoryId) matchQuery.categoryId = categoryId;

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : '%Y-%m',
              date: '$publishedAt'
            }
          },
          totalViews: { $sum: '$statistics.viewCount' },
          totalLikes: { $sum: '$statistics.likeCount' },
          totalComments: { $sum: '$statistics.commentCount' },
          avgEngagement: { $avg: '$engagementRate' },
          videoCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: parseInt(limit as string) }
    ];

    const historicalData = await Video.aggregate(pipeline);

    // Calculate trend analysis
    const timeSeriesData = historicalData.map((item, index) => ({
      x: index,
      y: item[`total${metric.charAt(0).toUpperCase() + metric.slice(1)}`] || item.avgEngagement
    }));

    const trendAnalysis = timeSeriesData.length > 1 
      ? StatisticalAnalyzer.analyzeTrend(timeSeriesData)
      : null;

    res.json({
      success: true,
      data: {
        historicalData,
        trendAnalysis,
        period,
        metric
      }
    });

  } catch (error) {
    console.error('Error fetching historical trends:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch historical trends'
    });
  }
});

// Performance insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const { timeRange = '30d' } = req.query;
    
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

    // Get comprehensive analytics
    const [
      topPerformers,
      categoryPerformance,
      engagementInsights,
      growthMetrics
    ] = await Promise.all([
      // Top performing videos
      Video.find({ publishedAt: { $gte: startDate } })
        .sort({ trendingScore: -1 })
        .limit(20)
        .select('videoId title channelTitle statistics engagementRate trendingScore'),
      
      // Category performance analysis
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$categoryId',
            avgViews: { $avg: '$statistics.viewCount' },
            avgLikes: { $avg: '$statistics.likeCount' },
            avgComments: { $avg: '$statistics.commentCount' },
            avgEngagement: { $avg: '$engagementRate' },
            videoCount: { $sum: 1 },
            totalViews: { $sum: '$statistics.viewCount' }
          }
        },
        { $sort: { avgEngagement: -1 } }
      ]),

      // Engagement insights
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            highEngagement: {
              $sum: {
                $cond: [{ $gte: ['$engagementRate', 5] }, 1, 0]
              }
            },
            mediumEngagement: {
              $sum: {
                $cond: [
                  { $and: [
                    { $gte: ['$engagementRate', 2] },
                    { $lt: ['$engagementRate', 5] }
                  ]}, 1, 0
                ]
              }
            },
            lowEngagement: {
              $sum: {
                $cond: [{ $lt: ['$engagementRate', 2] }, 1, 0]
              }
            },
            totalVideos: { $sum: 1 }
          }
        }
      ]),

      // Growth metrics
      Video.aggregate([
        { $match: { publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$publishedAt'
              }
            },
            dailyViews: { $sum: '$statistics.viewCount' },
            dailyVideos: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Calculate growth rates
    const growthAnalysis = growthMetrics.length > 1 ? {
      viewsGrowth: StatisticalAnalyzer.calculateGrowthRate(
        growthMetrics[growthMetrics.length - 1].dailyViews,
        growthMetrics[0].dailyViews
      ),
      videosGrowth: StatisticalAnalyzer.calculateGrowthRate(
        growthMetrics[growthMetrics.length - 1].dailyVideos,
        growthMetrics[0].dailyVideos
      )
    } : null;

    res.json({
      success: true,
      data: {
        topPerformers,
        categoryPerformance,
        engagementInsights: engagementInsights[0] || {
          highEngagement: 0,
          mediumEngagement: 0,
          lowEngagement: 0,
          totalVideos: 0
        },
        growthAnalysis,
        timeRange
      }
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch insights'
    });
  }
});

export default router;

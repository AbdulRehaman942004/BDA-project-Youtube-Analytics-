import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import Channel from '../models/Channel';
import { enrichCategoryStats } from '../utils/categoryMapper';

const router = Router();

/**
 * GET /api/dataset/stats
 * Get dataset statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      countries,
      categories,
      dateRange
    ] = await Promise.all([
      Video.countDocuments(),
      Video.aggregate([
        { $group: { _id: null, total: { $sum: '$statistics.viewCount' } } }
      ]),
      Video.aggregate([
        { $group: { _id: null, total: { $sum: '$statistics.likeCount' } } }
      ]),
      Video.aggregate([
        { $group: { _id: null, total: { $sum: '$statistics.commentCount' } } }
      ]),
      Video.distinct('countryCode'),
      Video.distinct('categoryId'),
      Video.aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$publishedAt' },
            maxDate: { $max: '$publishedAt' }
          }
        }
      ])
    ]);

    return res.json({
      success: true,
      stats: {
        totalVideos: totalVideos || 0,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0,
        countries: countries.length,
        categories: categories.length,
        dateRange: dateRange[0] ? {
          from: dateRange[0].minDate,
          to: dateRange[0].maxDate
        } : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dataset stats'
    });
  }
});

/**
 * GET /api/dataset/videos
 * Get videos from dataset with filters
 */
router.get('/videos', async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      countryCode,
      categoryId,
      sortBy = 'trendingScore',
      order = 'desc',
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};
    if (countryCode) query.countryCode = countryCode;
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { channelTitle: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions: any = {};
    if (sortBy === 'trendingScore') {
      sortOptions.trendingScore = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'views') {
      sortOptions['statistics.viewCount'] = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'publishedAt') {
      sortOptions.publishedAt = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.trendingScore = -1;
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Video.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get videos'
    });
  }
});

/**
 * GET /api/dataset/countries
 * Get list of countries in dataset
 */
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const countries = await Video.aggregate([
      {
        $group: {
          _id: '$countryCode',
          count: { $sum: 1 },
          totalViews: { $sum: '$statistics.viewCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json({
      success: true,
      countries: countries.map(c => ({
        code: c._id || 'Unknown',
        count: c.count,
        totalViews: c.totalViews
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get countries'
    });
  }
});

/**
 * GET /api/dataset/categories
 * Get category distribution
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const rawCategories = await Video.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          avgViews: { $avg: '$statistics.viewCount' },
          avgLikes: { $avg: '$statistics.likeCount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    // Enrich with category names
    const enrichedCategories = enrichCategoryStats(rawCategories);
    const categories = enrichedCategories.map((cat: any) => {
      const rawCat = rawCategories.find((r: any) => r._id === cat.id);
      return {
        ...cat,
        avgViews: rawCat?.avgViews || 0,
        avgLikes: rawCat?.avgLikes || 0
      };
    });

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get categories'
    });
  }
});

/**
 * GET /api/dataset/timeline
 * Get video count over time
 */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const { countryCode, groupBy = 'day' } = req.query;

    const matchQuery: any = {};
    if (countryCode) matchQuery.countryCode = countryCode;

    let dateFormat: any;
    if (groupBy === 'day') {
      dateFormat = {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' },
        day: { $dayOfMonth: '$publishedAt' }
      };
    } else if (groupBy === 'month') {
      dateFormat = {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' }
      };
    } else {
      dateFormat = { year: { $year: '$publishedAt' } };
    }

    const timeline = await Video.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 },
          avgViews: { $avg: '$statistics.viewCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return res.json({
      success: true,
      timeline: timeline.map(item => ({
        date: new Date(
          item._id.year,
          (item._id.month || 1) - 1,
          item._id.day || 1
        ),
        count: item.count,
        avgViews: Math.round(item.avgViews || 0)
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get timeline'
    });
  }
});

export default router;


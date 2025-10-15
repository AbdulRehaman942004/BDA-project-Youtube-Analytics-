import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const IS_DEMO_MODE = String(process.env.REACT_APP_DEMO).toLowerCase() === 'true';

// Create a real Axios instance (used when not in demo)
const realApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach interceptors to real API only
realApi.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

realApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// --- Demo mode mock implementation ---
type AxiosLikeResponse<T> = { data: T };

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function generateMockDashboard(daysLabel: string) {
  const categoryStats = Array.from({ length: 8 }).map((_, i) => ({ _id: i + 1, count: 10 + Math.floor(Math.random() * 90) }));
  const topVideos = Array.from({ length: 10 }).map((_, i) => ({
    title: `Demo Video Title ${i + 1}`,
    channelTitle: `Demo Channel ${i + 1}`,
    statistics: {
      viewCount: 10000 + Math.floor(Math.random() * 1000000),
      likeCount: 100 + Math.floor(Math.random() * 50000),
      commentCount: 10 + Math.floor(Math.random() * 5000),
    },
  }));
  const topChannels = Array.from({ length: 10 }).map((_, i) => ({
    title: `Top Channel ${i + 1}`,
    trendingVideosCount: 1 + Math.floor(Math.random() * 20),
    statistics: { subscriberCount: 100000 + Math.floor(Math.random() * 9000000) },
  }));
  const trendingKeywords = Array.from({ length: 20 }).map((_, i) => ({ keyword: `keyword_${i + 1}`, trendScore: 50 + Math.random() * 50, category: `C${(i % 5) + 1}` }));

  return {
    overview: {
      totalVideos: 5000 + Math.floor(Math.random() * 5000),
      totalViews: 5_000_000 + Math.floor(Math.random() * 10_000_000),
      timeRange: daysLabel,
    },
    topVideos,
    topChannels,
    categoryStats,
    engagementStats: {
      avgEngagement: 5 + Math.random() * 10,
      maxEngagement: 20 + Math.random() * 30,
      minEngagement: 1 + Math.random() * 3,
    },
    trendingKeywords,
  };
}

function generateMockTrending(count: number) {
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    videoId: `demo_video_${i + 1}`,
    title: `Trending Demo Video ${i + 1}`,
    description: 'This is a demo description for a trending video.',
    channelTitle: `Demo Channel ${((i % 8) + 1)}`,
    publishedAt: new Date(now - i * 86400000).toISOString(),
    thumbnails: {
      medium: `https://picsum.photos/seed/trending-${i}/400/225`,
      high: `https://picsum.photos/seed/trending-${i}/800/450`,
    },
    statistics: {
      viewCount: 10000 + Math.floor(Math.random() * 1_000_000),
      likeCount: 100 + Math.floor(Math.random() * 50_000),
      commentCount: 10 + Math.floor(Math.random() * 5_000),
    },
    trendingScore: 1000 + Math.random() * 5000,
    engagementRate: 1 + Math.random() * 10,
  }));
}

function generateMockSearch(count: number) {
  const now = Date.now();
  return Array.from({ length: count }).map((_, i) => ({
    videoId: `search_demo_${i + 1}`,
    title: `Search Result Demo Video ${i + 1}`,
    description: 'Demo search result description with placeholder text.',
    channelTitle: `Search Channel ${((i % 6) + 1)}`,
    publishedAt: new Date(now - i * 43200000).toISOString(),
    thumbnails: {
      medium: `https://picsum.photos/seed/search-${i}/400/225`,
      high: `https://picsum.photos/seed/search-${i}/800/450`,
    },
    categoryId: String((i % 10) + 1),
  }));
}

// Minimal mock that mirrors the subset of axios we use (get only)
const mockApi = {
  get: (url: string, options?: { params?: Record<string, any> }): Promise<AxiosLikeResponse<{ data: any }>> => {
    const path = url.split('?')[0];
    // Simulate small network delay
    if (path === '/analytics/dashboard') {
      const timeRange = options?.params?.timeRange || '7d';
      const data = generateMockDashboard(timeRange);
      return delay({ data: { data } });
    }
    if (path === '/youtube/trending') {
      const maxResults = Number(options?.params?.maxResults ?? 25);
      const data = generateMockTrending(Math.min(Math.max(maxResults, 1), 50));
      return delay({ data: { data } });
    }
    if (path === '/youtube/search') {
      const maxResults = Number(options?.params?.maxResults ?? 25);
      const data = generateMockSearch(Math.min(Math.max(maxResults, 1), 50));
      return delay({ data: { data } });
    }
    // Default unknown route: empty payload
    return delay({ data: { data: null } });
  },
};

const api = IS_DEMO_MODE ? (mockApi as unknown as typeof realApi) : realApi;

export default api;

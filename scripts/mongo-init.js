// MongoDB initialization script
db = db.getSiblingDB('youtube_trends');

// Create collections
db.createCollection('videos');
db.createCollection('channels');
db.createCollection('trends');

// Create indexes for better performance
db.videos.createIndex({ videoId: 1 }, { unique: true });
db.videos.createIndex({ channelId: 1 });
db.videos.createIndex({ categoryId: 1 });
db.videos.createIndex({ trendingScore: -1 });
db.videos.createIndex({ engagementRate: -1 });
db.videos.createIndex({ publishedAt: -1 });

db.channels.createIndex({ channelId: 1 }, { unique: true });
db.channels.createIndex({ trendingVideosCount: -1 });
db.channels.createIndex({ averageEngagementRate: -1 });

db.trends.createIndex({ keyword: 1 });
db.trends.createIndex({ category: 1 });
db.trends.createIndex({ trendScore: -1 });
db.trends.createIndex({ status: 1 });
db.trends.createIndex({ startDate: -1 });

// Create a sample user for authentication (optional)
db.createUser({
  user: 'youtube_user',
  pwd: 'youtube_password',
  roles: [
    {
      role: 'readWrite',
      db: 'youtube_trends'
    }
  ]
});

print('Database initialized successfully!');

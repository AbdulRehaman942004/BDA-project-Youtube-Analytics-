import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: Date;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  categoryId: string;
  tags: string[];
  duration: string;
  trendingScore: number;
  engagementRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  channelId: {
    type: String,
    required: true,
    index: true
  },
  channelTitle: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  thumbnails: {
    default: String,
    medium: String,
    high: String
  },
  statistics: {
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  categoryId: {
    type: String,
    index: true
  },
  tags: [String],
  duration: String,
  trendingScore: {
    type: Number,
    default: 0,
    index: true
  },
  engagementRate: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
VideoSchema.index({ trendingScore: -1, publishedAt: -1 });
VideoSchema.index({ channelId: 1, publishedAt: -1 });
VideoSchema.index({ categoryId: 1, trendingScore: -1 });
VideoSchema.index({ publishedAt: -1 });

// Virtual for calculating engagement rate
VideoSchema.virtual('calculatedEngagementRate').get(function() {
  if (this.statistics.viewCount > 0) {
    return ((this.statistics.likeCount + this.statistics.commentCount) / this.statistics.viewCount) * 100;
  }
  return 0;
});

// Pre-save middleware to calculate engagement rate
VideoSchema.pre<IVideo>('save', function(next) {
  if (this.statistics.viewCount > 0) {
    this.engagementRate = ((this.statistics.likeCount + this.statistics.commentCount) / this.statistics.viewCount) * 100;
  }
  next();
});

export default mongoose.model<IVideo>('Video', VideoSchema);

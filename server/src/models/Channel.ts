import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  channelId: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  statistics: {
    viewCount: number;
    subscriberCount: number;
    videoCount: number;
  };
  country: string;
  publishedAt: Date;
  trendingVideosCount: number;
  averageEngagementRate: number;
  totalViews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema: Schema = new Schema({
  channelId: {
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
  customUrl: {
    type: String,
    trim: true
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
    subscriberCount: {
      type: Number,
      default: 0
    },
    videoCount: {
      type: Number,
      default: 0
    }
  },
  country: {
    type: String,
    index: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  trendingVideosCount: {
    type: Number,
    default: 0,
    index: true
  },
  averageEngagementRate: {
    type: Number,
    default: 0,
    index: true
  },
  totalViews: {
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
ChannelSchema.index({ trendingVideosCount: -1 });
ChannelSchema.index({ averageEngagementRate: -1 });
ChannelSchema.index({ totalViews: -1 });
ChannelSchema.index({ statistics.subscriberCount: -1 });

export default mongoose.model<IChannel>('Channel', ChannelSchema);

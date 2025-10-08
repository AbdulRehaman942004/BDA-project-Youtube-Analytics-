import mongoose, { Document, Schema } from 'mongoose';

export interface ITrend extends Document {
  keyword: string;
  category: string;
  trendScore: number;
  peakScore: number;
  duration: number; // in hours
  startDate: Date;
  peakDate: Date;
  endDate?: Date;
  relatedVideos: string[]; // Array of video IDs
  relatedChannels: string[]; // Array of channel IDs
  geographicData: {
    country: string;
    score: number;
  }[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  status: 'active' | 'declining' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const TrendSchema: Schema = new Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  trendScore: {
    type: Number,
    required: true,
    index: true
  },
  peakScore: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  peakDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    index: true
  },
  relatedVideos: [{
    type: String,
    ref: 'Video'
  }],
  relatedChannels: [{
    type: String,
    ref: 'Channel'
  }],
  geographicData: [{
    country: String,
    score: Number
  }],
  sentiment: {
    positive: {
      type: Number,
      default: 0
    },
    negative: {
      type: Number,
      default: 0
    },
    neutral: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'declining', 'ended'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
TrendSchema.index({ category: 1, trendScore: -1 });
TrendSchema.index({ status: 1, startDate: -1 });
TrendSchema.index({ keyword: 1, status: 1 });

export default mongoose.model<ITrend>('Trend', TrendSchema);

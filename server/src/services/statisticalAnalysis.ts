import _ from 'lodash';

export interface StatisticalMetrics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  outliers: number[];
}

export interface CorrelationAnalysis {
  correlation: number;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
}

export interface TrendAnalysis {
  slope: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  rSquared: number;
}

export class StatisticalAnalyzer {
  
  /**
   * Calculate comprehensive statistical metrics for a dataset
   */
  static calculateMetrics(data: number[]): StatisticalMetrics {
    if (data.length === 0) {
      throw new Error('Dataset cannot be empty');
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const n = data.length;

    // Basic statistics
    const mean = _.sum(data) / n;
    const median = this.calculateMedian(sortedData);
    const mode = this.calculateMode(data);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // Variance and standard deviation
    const variance = _.sum(data.map(x => Math.pow(x - mean, 2))) / n;
    const standardDeviation = Math.sqrt(variance);

    // Quartiles
    const quartiles = this.calculateQuartiles(sortedData);

    // Outliers using IQR method
    const outliers = this.detectOutliers(data, quartiles);

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min,
      max,
      range,
      quartiles,
      outliers
    };
  }

  /**
   * Calculate correlation between two datasets
   */
  static calculateCorrelation(x: number[], y: number[]): CorrelationAnalysis {
    if (x.length !== y.length) {
      throw new Error('Datasets must have the same length');
    }

    const n = x.length;
    const sumX = _.sum(x);
    const sumY = _.sum(y);
    const sumXY = _.sum(x.map((xi, i) => xi * y[i]));
    const sumX2 = _.sum(x.map(xi => xi * xi));
    const sumY2 = _.sum(y.map(yi => yi * yi));

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    const correlation = denominator === 0 ? 0 : numerator / denominator;

    return {
      correlation,
      strength: this.getCorrelationStrength(Math.abs(correlation)),
      direction: correlation >= 0 ? 'positive' : 'negative'
    };
  }

  /**
   * Analyze trend in time series data
   */
  static analyzeTrend(data: { x: number; y: number }[]): TrendAnalysis {
    if (data.length < 2) {
      throw new Error('At least 2 data points required for trend analysis');
    }

    const n = data.length;
    const sumX = _.sum(data.map(d => d.x));
    const sumY = _.sum(data.map(d => d.y));
    const sumXY = _.sum(data.map(d => d.x * d.y));
    const sumX2 = _.sum(data.map(d => d.x * d.x));
    const sumY2 = _.sum(data.map(d => d.y * d.y));

    // Calculate slope using least squares method
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = _.sum(data.map(d => Math.pow(d.y - yMean, 2)));
    const ssResidual = _.sum(data.map(d => {
      const predicted = slope * d.x + (sumY - slope * sumX) / n;
      return Math.pow(d.y - predicted, 2);
    }));
    const rSquared = 1 - (ssResidual / ssTotal);

    return {
      slope,
      direction: this.getTrendDirection(slope),
      strength: this.getTrendStrength(Math.abs(rSquared)),
      rSquared
    };
  }

  /**
   * Calculate growth rate between two periods
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(beginningValue: number, endingValue: number, years: number): number {
    if (beginningValue <= 0 || years <= 0) return 0;
    return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
  }

  /**
   * Calculate engagement score based on multiple metrics
   */
  static calculateEngagementScore(views: number, likes: number, comments: number, shares?: number): number {
    const baseScore = (likes + comments * 2) / Math.max(views, 1) * 100;
    const shareBonus = shares ? (shares * 3) / Math.max(views, 1) * 100 : 0;
    return baseScore + shareBonus;
  }

  /**
   * Calculate trending velocity (rate of change in trending score)
   */
  static calculateTrendingVelocity(currentScore: number, previousScore: number, timeDiffHours: number): number {
    if (timeDiffHours === 0) return 0;
    return (currentScore - previousScore) / timeDiffHours;
  }

  /**
   * Detect anomalies in time series data using statistical methods
   */
  static detectAnomalies(data: number[], threshold: number = 2): number[] {
    const metrics = this.calculateMetrics(data);
    const anomalies: number[] = [];

    data.forEach((value, index) => {
      const zScore = Math.abs((value - metrics.mean) / metrics.standardDeviation);
      if (zScore > threshold) {
        anomalies.push(index);
      }
    });

    return anomalies;
  }

  /**
   * Calculate market share for channels
   */
  static calculateMarketShare(channelViews: number, totalMarketViews: number): number {
    if (totalMarketViews === 0) return 0;
    return (channelViews / totalMarketViews) * 100;
  }

  // Helper methods
  private static calculateMedian(sortedData: number[]): number {
    const n = sortedData.length;
    if (n % 2 === 0) {
      return (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
    }
    return sortedData[Math.floor(n / 2)];
  }

  private static calculateMode(data: number[]): number {
    const frequency: { [key: number]: number } = {};
    data.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });

    let maxFreq = 0;
    let mode = data[0];
    Object.entries(frequency).forEach(([value, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = Number(value);
      }
    });

    return mode;
  }

  private static calculateQuartiles(sortedData: number[]): { q1: number; q2: number; q3: number } {
    const n = sortedData.length;
    const q2 = this.calculateMedian(sortedData);
    
    const lowerHalf = sortedData.slice(0, Math.floor(n / 2));
    const upperHalf = sortedData.slice(Math.ceil(n / 2));
    
    const q1 = this.calculateMedian(lowerHalf);
    const q3 = this.calculateMedian(upperHalf);

    return { q1, q2, q3 };
  }

  private static detectOutliers(data: number[], quartiles: { q1: number; q3: number }): number[] {
    const iqr = quartiles.q3 - quartiles.q1;
    const lowerBound = quartiles.q1 - 1.5 * iqr;
    const upperBound = quartiles.q3 + 1.5 * iqr;

    return data.filter(value => value < lowerBound || value > upperBound);
  }

  private static getCorrelationStrength(absCorrelation: number): 'weak' | 'moderate' | 'strong' {
    if (absCorrelation >= 0.7) return 'strong';
    if (absCorrelation >= 0.3) return 'moderate';
    return 'weak';
  }

  private static getTrendDirection(slope: number): 'increasing' | 'decreasing' | 'stable' {
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }

  private static getTrendStrength(rSquared: number): 'weak' | 'moderate' | 'strong' {
    if (rSquared >= 0.7) return 'strong';
    if (rSquared >= 0.3) return 'moderate';
    return 'weak';
  }
}

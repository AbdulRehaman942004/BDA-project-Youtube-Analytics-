import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  filename?: string;
  includeCharts?: boolean;
  timeRange?: string;
}

export class DataExporter {
  
  /**
   * Export analytics data to CSV format
   */
  static async exportToCSV(data: any[], filename?: string): Promise<string> {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      
      const exportFilename = filename || `analytics_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
      const filePath = path.join(process.cwd(), 'exports', exportFilename);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, csv);
      return filePath;
    } catch (error) {
      throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export analytics data to PDF format
   */
  static async exportToPDF(data: any, options: ExportOptions = {}): Promise<string> {
    try {
      const filename = options.filename || `analytics_report_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;
      const filePath = path.join(process.cwd(), 'exports', filename);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(fs.createWriteStream(filePath));

      // Header
      doc.fontSize(20)
         .text('YouTube Analytics Report', 50, 50)
         .fontSize(12)
         .text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, 50, 80);

      let yPosition = 120;

      // Overview section
      if (data.overview) {
        doc.fontSize(16)
           .text('Overview', 50, yPosition)
           .fontSize(12);
        
        yPosition += 30;
        
        const overviewData = [
          ['Metric', 'Value'],
          ['Total Videos', data.overview.totalVideos?.toLocaleString() || '0'],
          ['Total Views', data.overview.totalViews?.toLocaleString() || '0'],
          ['Time Range', data.overview.timeRange || 'N/A']
        ];

        this.addTableToPDF(doc, overviewData, 50, yPosition);
        yPosition += 150;
      }

      // Top Videos section
      if (data.topVideos && data.topVideos.length > 0) {
        doc.fontSize(16)
           .text('Top Trending Videos', 50, yPosition)
           .fontSize(12);
        
        yPosition += 30;

        const videosData = [
          ['Title', 'Channel', 'Views', 'Likes', 'Comments', 'Engagement %']
        ];

        data.topVideos.slice(0, 10).forEach((video: any) => {
          videosData.push([
            video.title?.substring(0, 30) + '...' || 'N/A',
            video.channelTitle || 'N/A',
            video.statistics?.viewCount?.toLocaleString() || '0',
            video.statistics?.likeCount?.toLocaleString() || '0',
            video.statistics?.commentCount?.toLocaleString() || '0',
            video.engagementRate?.toFixed(2) + '%' || '0%'
          ]);
        });

        this.addTableToPDF(doc, videosData, 50, yPosition);
        yPosition += 200;
      }

      // Category Statistics
      if (data.categoryStats && data.categoryStats.length > 0) {
        doc.fontSize(16)
           .text('Category Distribution', 50, yPosition)
           .fontSize(12);
        
        yPosition += 30;

        const categoryData = [
          ['Category ID', 'Video Count']
        ];

        data.categoryStats.forEach((category: any) => {
          categoryData.push([
            category._id || 'N/A',
            category.count?.toString() || '0'
          ]);
        });

        this.addTableToPDF(doc, categoryData, 50, yPosition);
        yPosition += 150;
      }

      // Statistical Analysis
      if (data.statisticalAnalysis) {
        doc.fontSize(16)
           .text('Statistical Analysis', 50, yPosition)
           .fontSize(12);
        
        yPosition += 30;

        const stats = data.statisticalAnalysis.metrics;
        if (stats.views) {
          doc.text(`Views Statistics:`, 50, yPosition)
             .text(`  Mean: ${stats.views.mean?.toLocaleString() || 'N/A'}`, 70, yPosition + 20)
             .text(`  Median: ${stats.views.median?.toLocaleString() || 'N/A'}`, 70, yPosition + 40)
             .text(`  Standard Deviation: ${stats.views.standardDeviation?.toFixed(2) || 'N/A'}`, 70, yPosition + 60);
          yPosition += 100;
        }

        if (stats.engagement) {
          doc.text(`Engagement Statistics:`, 50, yPosition)
             .text(`  Mean: ${stats.engagement.mean?.toFixed(2) || 'N/A'}%`, 70, yPosition + 20)
             .text(`  Median: ${stats.engagement.median?.toFixed(2) || 'N/A'}%`, 70, yPosition + 40)
             .text(`  Max: ${stats.engagement.max?.toFixed(2) || 'N/A'}%`, 70, yPosition + 60);
          yPosition += 100;
        }
      }

      // Footer
      doc.fontSize(10)
         .text('Generated by YouTube Trends Analytics Platform', 50, doc.page.height - 50);

      doc.end();

      return filePath;
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export analytics data to JSON format
   */
  static async exportToJSON(data: any, filename?: string): Promise<string> {
    try {
      const exportFilename = filename || `analytics_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
      const filePath = path.join(process.cwd(), 'exports', exportFilename);
      
      // Ensure exports directory exists
      const exportsDir = path.dirname(filePath);
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return filePath;
    } catch (error) {
      throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export comparative analysis data
   */
  static async exportComparison(data: any, format: 'csv' | 'pdf' | 'json', filename?: string): Promise<string> {
    try {
      switch (format) {
        case 'csv':
          return await this.exportToCSV(this.flattenComparisonData(data), filename);
        case 'pdf':
          return await this.exportToPDF(data, { filename, format: 'pdf' });
        case 'json':
          return await this.exportToJSON(data, filename);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      throw new Error(`Failed to export comparison data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export historical trend data
   */
  static async exportHistoricalTrends(data: any, format: 'csv' | 'pdf' | 'json', filename?: string): Promise<string> {
    try {
      switch (format) {
        case 'csv':
          return await this.exportToCSV(data.historicalData || [], filename);
        case 'pdf':
          return await this.exportToPDF(data, { filename, format: 'pdf' });
        case 'json':
          return await this.exportToJSON(data, filename);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      throw new Error(`Failed to export historical trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private static addTableToPDF(doc: PDFDocument, data: string[][], x: number, y: number): void {
    const cellWidth = 100;
    const cellHeight = 20;
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellX = x + (colIndex * cellWidth);
        const cellY = y + (rowIndex * cellHeight);
        
        // Draw cell border
        doc.rect(cellX, cellY, cellWidth, cellHeight).stroke();
        
        // Add text
        doc.text(cell, cellX + 5, cellY + 5, {
          width: cellWidth - 10,
          height: cellHeight - 10,
          align: 'left'
        });
      });
    });
  }

  private static flattenComparisonData(data: any): any[] {
    const flattened: any[] = [];
    
    if (data.channels) {
      data.channels.forEach((channel: any) => {
        flattened.push({
          type: 'channel',
          id: channel.channelId,
          title: channel.title,
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
          totalViews: channel.metrics.totalViews,
          totalLikes: channel.metrics.totalLikes,
          totalComments: channel.metrics.totalComments,
          avgEngagement: channel.metrics.avgEngagement,
          avgTrendingScore: channel.metrics.avgTrendingScore
        });
      });
    }
    
    if (data.videos) {
      data.videos.forEach((video: any) => {
        flattened.push({
          type: 'video',
          id: video.videoId,
          title: video.title,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          commentCount: video.statistics.commentCount,
          engagementRate: video.engagementRate,
          trendingScore: video.trendingScore,
          categoryId: video.categoryId
        });
      });
    }
    
    return flattened;
  }
}

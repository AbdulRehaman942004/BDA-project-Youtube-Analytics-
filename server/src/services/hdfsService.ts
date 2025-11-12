import axios, { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';

export interface HDFSConfig {
  host: string;
  port: number;
  user: string;
  path: string;
}

export interface HDFSFileInfo {
  path: string;
  type: 'FILE' | 'DIRECTORY';
  length: number;
  modificationTime: number;
  accessTime: number;
  owner: string;
  group: string;
  permission: string;
}

export class HDFSService {
  private config: HDFSConfig;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.config = {
      host: process.env.HDFS_HOST || 'localhost',
      port: parseInt(process.env.HDFS_PORT || '9870'),
      user: process.env.HDFS_USER || 'hadoop',
      path: process.env.HDFS_BASE_PATH || '/youtube-trends'
    };

    this.baseUrl = `http://${this.config.host}:${this.config.port}/webhdfs/v1`;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Check if HDFS is enabled and accessible
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabled = process.env.HDFS_ENABLED === 'true';
      if (!enabled) {
        return false;
      }
      
      // Try to list root directory to verify connection
      await this.listDirectory('/');
      return true;
    } catch (error) {
      console.warn('HDFS is not accessible:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Create a directory in HDFS
   */
  async createDirectory(hdfsPath: string): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(hdfsPath);
      const url = `${this.baseUrl}${fullPath}`;
      
      const response = await this.axiosInstance.put(url, null, {
        params: {
          'op': 'MKDIRS',
          'user.name': this.config.user
        }
      });

      return response.data.boolean === true;
    } catch (error) {
      console.error('Error creating HDFS directory:', error);
      throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload data to HDFS as JSON file
   */
  async uploadData(data: any, hdfsPath: string, filename: string): Promise<string> {
    try {
      const fullPath = this.getFullPath(`${hdfsPath}/${filename}`);
      
      // Ensure directory exists
      await this.createDirectory(hdfsPath);

      // Convert data to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Step 1: Create file (redirect)
      const createUrl = `${this.baseUrl}${fullPath}`;
      const createResponse = await this.axiosInstance.put(createUrl, null, {
        params: {
          'op': 'CREATE',
          'user.name': this.config.user,
          'overwrite': 'true'
        },
        maxRedirects: 0,
        validateStatus: (status) => status === 307 || status === 201
      });

      // Step 2: Upload data to the redirect URL
      const redirectUrl = createResponse.headers.location || createResponse.request.res.responseUrl;
      if (redirectUrl) {
        await this.axiosInstance.put(redirectUrl, jsonData, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
      } else {
        // Fallback: write to redirect location from response
        const location = createResponse.headers.location;
        if (location) {
          await this.axiosInstance.put(location, jsonData, {
            headers: {
              'Content-Type': 'application/octet-stream'
            }
          });
        }
      }

      return fullPath;
    } catch (error) {
      console.error('Error uploading to HDFS:', error);
      // If HDFS is not available, we'll just log and continue
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        console.warn('HDFS connection refused. Continuing without HDFS storage.');
        return '';
      }
      throw new Error(`Failed to upload to HDFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file from local filesystem to HDFS
   */
  async uploadFile(localPath: string, hdfsPath: string): Promise<string> {
    try {
      const filename = path.basename(localPath);
      const fullPath = this.getFullPath(`${hdfsPath}/${filename}`);
      
      // Ensure directory exists
      await this.createDirectory(hdfsPath);

      // Read local file
      const fileData = fs.readFileSync(localPath);
      
      // Step 1: Create file (redirect)
      const createUrl = `${this.baseUrl}${fullPath}`;
      const createResponse = await this.axiosInstance.put(createUrl, null, {
        params: {
          'op': 'CREATE',
          'user.name': this.config.user,
          'overwrite': 'true'
        },
        maxRedirects: 0,
        validateStatus: (status) => status === 307 || status === 201
      });

      // Step 2: Upload file to the redirect URL
      const redirectUrl = createResponse.headers.location || createResponse.request.res.responseUrl;
      if (redirectUrl) {
        await this.axiosInstance.put(redirectUrl, fileData, {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        });
      }

      return fullPath;
    } catch (error) {
      console.error('Error uploading file to HDFS:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from HDFS
   */
  async downloadFile(hdfsPath: string, localPath?: string): Promise<Buffer | string> {
    try {
      const fullPath = this.getFullPath(hdfsPath);
      const url = `${this.baseUrl}${fullPath}`;
      
      const response = await this.axiosInstance.get(url, {
        params: {
          'op': 'OPEN',
          'user.name': this.config.user
        },
        responseType: 'arraybuffer',
        maxRedirects: 5
      });

      const buffer = Buffer.from(response.data);

      if (localPath) {
        fs.writeFileSync(localPath, buffer);
        return localPath;
      }

      return buffer;
    } catch (error) {
      console.error('Error downloading from HDFS:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(hdfsPath: string): Promise<HDFSFileInfo[]> {
    try {
      const fullPath = this.getFullPath(hdfsPath);
      const url = `${this.baseUrl}${fullPath}`;
      
      const response = await this.axiosInstance.get(url, {
        params: {
          'op': 'LISTSTATUS',
          'user.name': this.config.user
        }
      });

      const files = response.data.FileStatuses?.FileStatus || [];
      return files.map((file: any) => ({
        path: `${fullPath}/${file.pathSuffix}`,
        type: file.type === 'FILE' ? 'FILE' : 'DIRECTORY',
        length: file.length || 0,
        modificationTime: file.modificationTime || 0,
        accessTime: file.accessTime || 0,
        owner: file.owner || '',
        group: file.group || '',
        permission: file.permission || ''
      }));
    } catch (error) {
      console.error('Error listing HDFS directory:', error);
      throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file status
   */
  async getFileStatus(hdfsPath: string): Promise<HDFSFileInfo | null> {
    try {
      const fullPath = this.getFullPath(hdfsPath);
      const url = `${this.baseUrl}${fullPath}`;
      
      const response = await this.axiosInstance.get(url, {
        params: {
          'op': 'GETFILESTATUS',
          'user.name': this.config.user
        }
      });

      const file = response.data.FileStatus;
      if (!file) {
        return null;
      }

      return {
        path: fullPath,
        type: file.type === 'FILE' ? 'FILE' : 'DIRECTORY',
        length: file.length || 0,
        modificationTime: file.modificationTime || 0,
        accessTime: file.accessTime || 0,
        owner: file.owner || '',
        group: file.group || '',
        permission: file.permission || ''
      };
    } catch (error) {
      console.error('Error getting file status:', error);
      return null;
    }
  }

  /**
   * Delete file or directory from HDFS
   */
  async delete(hdfsPath: string, recursive: boolean = false): Promise<boolean> {
    try {
      const fullPath = this.getFullPath(hdfsPath);
      const url = `${this.baseUrl}${fullPath}`;
      
      const response = await this.axiosInstance.delete(url, {
        params: {
          'op': 'DELETE',
          'user.name': this.config.user,
          'recursive': recursive.toString()
        }
      });

      return response.data.boolean === true;
    } catch (error) {
      console.error('Error deleting from HDFS:', error);
      throw new Error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store video data in HDFS
   */
  async storeVideoData(videos: any[], date: string = new Date().toISOString().split('T')[0]): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const filename = `trending_videos_${date}_${Date.now()}.json`;
      const hdfsPath = `/videos/${date}`;
      
      const data = {
        timestamp,
        date,
        count: videos.length,
        videos: videos.map(video => ({
          videoId: video.videoId,
          title: video.title,
          channelId: video.channelId,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt,
          statistics: video.statistics,
          trendingScore: video.trendingScore,
          engagementRate: video.engagementRate,
          categoryId: video.categoryId
        }))
      };

      return await this.uploadData(data, hdfsPath, filename);
    } catch (error) {
      console.error('Error storing video data in HDFS:', error);
      return '';
    }
  }

  /**
   * Store analytics data in HDFS
   */
  async storeAnalyticsData(analytics: any, date: string = new Date().toISOString().split('T')[0]): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const filename = `analytics_${date}_${Date.now()}.json`;
      const hdfsPath = `/analytics/${date}`;
      
      const data = {
        timestamp,
        date,
        analytics
      };

      return await this.uploadData(data, hdfsPath, filename);
    } catch (error) {
      console.error('Error storing analytics data in HDFS:', error);
      return '';
    }
  }

  /**
   * Get full HDFS path
   */
  private getFullPath(hdfsPath: string): string {
    if (hdfsPath.startsWith('/')) {
      return hdfsPath;
    }
    return `${this.config.path}${hdfsPath.startsWith('/') ? '' : '/'}${hdfsPath}`;
  }
}

export default new HDFSService();


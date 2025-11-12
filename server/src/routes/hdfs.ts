import { Router, Request, Response } from 'express';
import hdfsService from '../services/hdfsService';

const router = Router();

/**
 * GET /api/hdfs/status
 * Check HDFS connection status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isEnabled = await hdfsService.isEnabled();
    
    return res.json({
      success: true,
      enabled: isEnabled,
      config: {
        host: process.env.HDFS_HOST || 'localhost',
        port: process.env.HDFS_PORT || '9870',
        user: process.env.HDFS_USER || 'hadoop',
        basePath: process.env.HDFS_BASE_PATH || '/youtube-trends'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check HDFS status'
    });
  }
});

/**
 * GET /api/hdfs/list/:path?
 * List directory contents in HDFS
 */
router.get('/list/:path?', async (req: Request, res: Response) => {
  try {
    const path = req.params.path || '/';
    const files = await hdfsService.listDirectory(path);
    
    return res.json({
      success: true,
      path,
      count: files.length,
      files
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list directory'
    });
  }
});

/**
 * GET /api/hdfs/file/:path
 * Get file status
 */
router.get('/file/:path(*)', async (req: Request, res: Response) => {
  try {
    const filePath = req.params.path;
    const fileStatus = await hdfsService.getFileStatus(filePath);
    
    if (!fileStatus) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    return res.json({
      success: true,
      file: fileStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file status'
    });
  }
});

/**
 * POST /api/hdfs/upload
 * Upload data to HDFS
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { data, hdfsPath, filename } = req.body;
    
    if (!data || !hdfsPath || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: data, hdfsPath, filename'
      });
    }
    
    const uploadedPath = await hdfsService.uploadData(data, hdfsPath, filename);
    
    return res.json({
      success: true,
      path: uploadedPath,
      message: 'Data uploaded to HDFS successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload data'
    });
  }
});

/**
 * GET /api/hdfs/download/:path
 * Download file from HDFS
 */
router.get('/download/:path(*)', async (req: Request, res: Response) => {
  try {
    const filePath = req.params.path;
    const buffer = await hdfsService.downloadFile(filePath) as Buffer;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filePath.split('/').pop()}"`);
    res.send(buffer);
    return;
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download file'
    });
  }
});

/**
 * POST /api/hdfs/mkdir
 * Create directory in HDFS
 */
router.post('/mkdir', async (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }
    
    const created = await hdfsService.createDirectory(path);
    
    return res.json({
      success: created,
      message: created ? 'Directory created successfully' : 'Directory already exists'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create directory'
    });
  }
});

/**
 * DELETE /api/hdfs/delete/:path
 * Delete file or directory from HDFS
 */
router.delete('/delete/:path(*)', async (req: Request, res: Response) => {
  try {
    const filePath = req.params.path;
    const { recursive } = req.query;
    
    const deleted = await hdfsService.delete(filePath, recursive === 'true');
    
    return res.json({
      success: deleted,
      message: 'Deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete'
    });
  }
});

/**
 * GET /api/hdfs/stats
 * Get HDFS storage statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const videosPath = '/videos';
    const analyticsPath = '/analytics';
    
    let videoFiles: any[] = [];
    let analyticsFiles: any[] = [];
    
    try {
      videoFiles = await hdfsService.listDirectory(videosPath);
    } catch (error) {
      console.warn('Could not list videos directory:', error);
    }
    
    try {
      analyticsFiles = await hdfsService.listDirectory(analyticsPath);
    } catch (error) {
      console.warn('Could not list analytics directory:', error);
    }
    
    return res.json({
      success: true,
      stats: {
        videoFiles: videoFiles.length,
        analyticsFiles: analyticsFiles.length,
        totalFiles: videoFiles.length + analyticsFiles.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get statistics'
    });
  }
});

export default router;


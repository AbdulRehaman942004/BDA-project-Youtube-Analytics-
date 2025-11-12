import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Storage,
  Upload,
  Download,
  Folder,
  InsertDriveFile,
  Delete,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface HDFSStatus {
  enabled: boolean;
  config: {
    host: string;
    port: string;
    user: string;
    basePath: string;
  };
}

interface HDFSFile {
  path: string;
  type: 'FILE' | 'DIRECTORY';
  length: number;
  modificationTime: number;
  owner: string;
  group: string;
  permission: string;
}

const HDFS: React.FC = () => {
  const [status, setStatus] = useState<HDFSStatus | null>(null);
  const [files, setFiles] = useState<HDFSFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadData, setUploadData] = useState({ hdfsPath: '', filename: '', data: '' });
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStatus();
    fetchStats();
  }, []);

  useEffect(() => {
    if (status?.enabled) {
      fetchFiles(currentPath);
    }
  }, [currentPath, status]);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/hdfs/status');
      setStatus(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch HDFS status');
      setStatus({ enabled: false, config: { host: '', port: '', user: '', basePath: '' } });
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (path: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/hdfs/list/${encodeURIComponent(path)}`);
      setFiles(response.data.files || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/hdfs/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      let dataToUpload;
      try {
        dataToUpload = JSON.parse(uploadData.data);
      } catch {
        dataToUpload = uploadData.data;
      }

      await api.post('/hdfs/upload', {
        data: dataToUpload,
        hdfsPath: uploadData.hdfsPath,
        filename: uploadData.filename,
      });

      setUploadDialog(false);
      setUploadData({ hdfsPath: '', filename: '', data: '' });
      fetchFiles(currentPath);
      fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const response = await api.get(`/hdfs/download/${encodeURIComponent(filePath)}`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download file');
    }
  };

  const handleDelete = async (filePath: string) => {
    if (!window.confirm(`Are you sure you want to delete ${filePath}?`)) {
      return;
    }

    try {
      await api.delete(`/hdfs/delete/${encodeURIComponent(filePath)}`);
      fetchFiles(currentPath);
      fetchStats();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !status) {
    return (
      <Container maxWidth="xl">
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading HDFS status...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Hadoop HDFS Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchStatus();
              fetchStats();
              if (status?.enabled) {
                fetchFiles(currentPath);
              }
            }}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDialog(true)}
            disabled={!status?.enabled}
          >
            Upload Data
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage color={status?.enabled ? 'success' : 'error'} sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">HDFS Status</Typography>
                  <Chip
                    label={status?.enabled ? 'Connected' : 'Disabled'}
                    color={status?.enabled ? 'success' : 'default'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              {status && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Host:</strong> {status.config.host}:{status.config.port}
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> {status.config.user}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Base Path:</strong> {status.config.basePath}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {stats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Storage Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Video Files:</strong> {stats.videoFiles}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Analytics Files:</strong> {stats.analyticsFiles}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Total Files:</strong> {stats.totalFiles}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {!status?.enabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          HDFS is currently disabled. To enable it, set HDFS_ENABLED=true in your .env file and ensure
          Hadoop is running with WebHDFS enabled.
        </Alert>
      )}

      {/* File Browser */}
      {status?.enabled && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                label="Current Path"
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                fullWidth
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                onClick={() => fetchFiles(currentPath)}
                disabled={loading}
              >
                Go
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Modified</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No files found
                        </TableCell>
                      </TableRow>
                    ) : (
                      files.map((file, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {file.type === 'DIRECTORY' ? (
                                <Folder sx={{ mr: 1, color: 'primary.main' }} />
                              ) : (
                                <InsertDriveFile sx={{ mr: 1 }} />
                              )}
                              {file.path.split('/').pop()}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={file.type}
                              size="small"
                              color={file.type === 'DIRECTORY' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{formatFileSize(file.length)}</TableCell>
                          <TableCell>{formatDate(file.modificationTime)}</TableCell>
                          <TableCell>{file.owner}</TableCell>
                          <TableCell align="right">
                            {file.type === 'FILE' && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownload(file.path)}
                                  color="primary"
                                >
                                  <Download />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(file.path)}
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </>
                            )}
                            {file.type === 'DIRECTORY' && (
                              <IconButton
                                size="small"
                                onClick={() => setCurrentPath(file.path)}
                                color="primary"
                              >
                                <Folder />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Data to HDFS</DialogTitle>
        <DialogContent>
          <TextField
            label="HDFS Path"
            value={uploadData.hdfsPath}
            onChange={(e) => setUploadData({ ...uploadData, hdfsPath: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="/videos/2024-01-01"
          />
          <TextField
            label="Filename"
            value={uploadData.filename}
            onChange={(e) => setUploadData({ ...uploadData, filename: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="data.json"
          />
          <TextField
            label="Data (JSON)"
            value={uploadData.data}
            onChange={(e) => setUploadData({ ...uploadData, data: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={6}
            placeholder='{"key": "value"}'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={uploading || !uploadData.hdfsPath || !uploadData.filename || !uploadData.data}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HDFS;


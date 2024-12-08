import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Box,
} from '@mui/material';
import { GetApp as GetAppIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchComponentFiles, uploadComponentFile, deleteFileRevision, downloadFile, openFile } from 'src/utils/api';
import { format } from 'date-fns';

const FileManagement = ({ componentId, setSnackbarMessage, setSnackbarOpen, onComponentUpdate }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, [componentId]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const fetchedFiles = await fetchComponentFiles(componentId);
      setFiles(fetchedFiles);
    } catch (err) {
      setError('Failed to load files. Please try again.');
      setSnackbarMessage('Failed to load files. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const response = await uploadComponentFile(file, componentId);
      await fetchFiles();
      
      if (response.component && onComponentUpdate) {
        onComponentUpdate(response.component);
      }

      setSnackbarMessage('File uploaded successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload file. Please try again.');
      setSnackbarMessage('Failed to upload file. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileAction = async (fileUrl, action) => {
    try {
      setIsLoading(true);
      if (action === 'download') {
        await downloadFile(fileUrl);
      } else if (action === 'open') {
        await openFile(fileUrl);
      }
      setSnackbarMessage(`File ${action}ed successfully`);
      setSnackbarOpen(true);
    } catch (err) {
      setError(`Failed to ${action} file. Please try again.`);
      setSnackbarMessage(`Failed to ${action} file. Please try again.`);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (revision) => {
    try {
      setIsLoading(true);
      await deleteFileRevision(componentId, revision);
      await fetchFiles();
      setSnackbarMessage('File deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting file:', err);
      setSnackbarMessage(err.message || 'Failed to delete file. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <input
        accept="*/*"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="raised-button-file">
        <Button variant="contained" component="span">
          อัพโหลดไฟล์
        </Button>
      </label>
      {uploadProgress > 0 && <Typography>กำลังอัพโหลด: {uploadProgress}%</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ชื่อไฟล์</TableCell>
            <TableCell>Revision</TableCell>
            <TableCell>วันที่อัพโหลด</TableCell>
            <TableCell>การดำเนินการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index}>
              <TableCell>{file.file_name || file.s3_url.split('/').pop()}</TableCell>
              <TableCell>{file.revision}</TableCell>
              <TableCell>{format(new Date(file.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleFileAction(file.s3_url, 'download')}>
                  <GetAppIcon />
                </IconButton>
                <IconButton onClick={() => handleFileAction(file.s3_url, 'open')}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteFile(file.revision)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default FileManagement;
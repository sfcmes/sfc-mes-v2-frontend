import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Button, // Import Button here
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  fetchComponentByQR,
  updateComponentStatus,
  fetchComponentFiles,
  openFile,
  publicApi,
} from 'src/utils/api';
import ComponentCard from './ComponentCard';

const FormComponentCard = () => {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchComponentData = async () => {
    try {
      setLoading(true);
      const componentData = await fetchComponentByQR(id);
      const filesData = await fetchComponentFiles(id);
      setComponent({ ...componentData, files: filesData });
    } catch (err) {
      setError('Failed to load component data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setConfirmDialog({ open: true, action: () => updateStatus(newStatus) });
  };

  const updateStatus = async (newStatus) => {
    try {
      await updateComponentStatus(id, newStatus);
      await fetchComponentData(); // Refresh component data after status update
    } catch (err) {
      setError('Failed to update component status');
      console.error(err);
    }
  };

  const handleFileOpen = async (fileUrl) => {
    try {
      await openFile(fileUrl);
    } catch (err) {
      setError('Failed to open file');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!component) return <Typography>No component found</Typography>;

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      <ComponentCard
        component={component}
        onStatusChange={fetchComponentData} // Auto-refresh the component data
        onOpenFile={handleFileOpen}
      />

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
      >
        <DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
        <DialogContent>
          <Typography>คุณแน่ใจว่าต้องการเปลี่ยนสถานะของชิ้นงานนี้หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: null })} color="primary">
            ยกเลิก
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action) {
                confirmDialog.action();
              }
              setConfirmDialog({ open: false, action: null });
            }}
            color="error"
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormComponentCard;

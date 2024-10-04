import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  TextField,
} from '@mui/material';
import {
  fetchComponentByQR,
  updateComponentStatus,
  fetchComponentFiles,
  openFile,
  publicApi,
  checkUsername,
} from 'src/utils/api';
import ComponentCard from './ComponentCard';

const FormComponentCard = () => {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchComponentData = async () => {
    try {
      setLoading(true);
      const componentData = await fetchComponentByQR(id);
      const filesData = await fetchComponentFiles(id);
      setComponent({ ...componentData, files: filesData });
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลชิ้นงานได้');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!username) {
      setUsernameError('กรุณาใส่ชื่อผู้ใช้งาน');
      return;
    }
    try {
      const isValid = await checkUsername(username);
      if (isValid) {
        setConfirmDialog({ open: true, action: () => updateStatus(newStatus) });
      } else {
        setUsernameError('ชื่อผู้ใช้งานไม่ต้องถูก');
      }
    } catch (err) {
      setError('Failed to verify username');
      console.error(err);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await updateComponentStatus(id, newStatus, username);
      await fetchComponentData();
    } catch (err) {
      setError('ไม่สามารถอัพเดทสถานะชิ้นงานได้');
      console.error(err);
    }
  };

  const handleFileOpen = async (fileUrl) => {
    try {
      await openFile(fileUrl);
    } catch (err) {
      setError('ไม่สามารถเปิดไฟล์ได้');
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!component) return <Typography>No component found</Typography>;

  return (
    <Box sx={{ padding: isMobile ? 2 : 4 }}>
      <TextField
        label="ชื่อผุ้ใช้งาน"
        variant="outlined"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setUsernameError('');
        }}
        error={!!usernameError}
        helperText={usernameError}
        fullWidth
        margin="normal"
      />
      <ComponentCard
        component={component}
        onStatusChange={(newStatus) => handleStatusChange(newStatus)}
        onOpenFile={handleFileOpen}
        disableActions={!username}
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
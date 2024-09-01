import React, { useState, useEffect, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  fetchComponentById,
  fetchUserById,
  fetchUserProfile,
  updateComponentStatus,
} from 'src/utils/api';
import ComponentDetails from './ComponentDetails';
import FileManagement from './FileManagement';

const ComponentDialog = memo(({ open, onClose, component, onComponentUpdate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [componentDetails, setComponentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusDisplayMap = {
    manufactured: 'ผลิตแล้ว',
    in_transit: 'อยู่ระหว่างขนส่ง',
    transported: 'ขนส่งสำเร็จ',
    accepted: 'ตรวจรับแล้ว',
    installed: 'ติดตั้งแล้ว',
    rejected: 'ถูกปฏิเสธ',
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!component || !component.id) {
        setError('No component information provided');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [details, userProfile] = await Promise.all([
          fetchComponentById(component.id),
          fetchUserProfile(),
        ]);

        // Fetch usernames for history items
        const historyWithUsernames = await Promise.all(
          details.history.map(async (item) => {
            const user = await fetchUserById(item.updated_by);
            return { ...item, username: user.username };
          })
        );

        setComponentDetails({ ...details, history: historyWithUsernames });
        setUserRole(userProfile.role);
        setNewStatus(details.status);
      } catch (error) {
        console.error('Error fetching component details:', error);
        setError('ไม่สามารถโหลดข้อมูลชิ้นงานได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDetails();
    }
  }, [open, component]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
        if (!newStatus) {
            throw new Error('Please select a status');
        }
        await updateComponentStatus(component.id, newStatus);
        const updatedDetails = await fetchComponentById(component.id);
        setComponentDetails(updatedDetails);
        setSnackbarMessage('อัพเดทสถานะเรียบร้อยแล้ว');
        setSnackbarOpen(true);
        
        // Call this function to trigger a refresh
        onComponentUpdate(updatedDetails); // Pass the updated component details here
    } catch (error) {
        console.error('Error updating status:', error);
        setSnackbarMessage(error.message || 'ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่');
        setSnackbarOpen(true);
    } finally {
        setIsUpdating(false);
    }
};


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียด: {componentDetails?.name}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="รายละเอียดชิ้นงาน" />
            <Tab label="ประวัติสถานะ" />
            <Tab label="อัพเดทสถานะ" />
            <Tab label="จัดการไฟล์" />
          </Tabs>
          {tabValue === 0 && componentDetails && (
            <ComponentDetails 
              componentId={component.id}
              componentDetails={componentDetails}
              userRole={userRole}
              onUpdate={(updatedDetails) => {
                setComponentDetails(updatedDetails);
                onComponentUpdate(); // Call this function to trigger a refresh
              }}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarOpen={setSnackbarOpen}
            />
          )}
          {tabValue === 1 && componentDetails && componentDetails.history && (
            <Box>
              <Typography variant="h6" gutterBottom>
                ประวัติสถานะ
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>วันที่อัปเดต</TableCell>
                    <TableCell>อัปเดตโดย</TableCell>
                    <TableCell>หมายเหตุ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {componentDetails.history.map((historyItem, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {statusDisplayMap[historyItem.status] || historyItem.status}
                      </TableCell>
                      <TableCell>
                        {new Date(historyItem.updated_at).toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell>{historyItem.username}</TableCell>
                      <TableCell>{historyItem.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          {tabValue === 2 &&
            (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'site user') && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  อัพเดทสถานะ
                </Typography>
                <Select value={newStatus} onChange={handleStatusChange} fullWidth margin="normal">
                  {Object.entries(statusDisplayMap).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  sx={{ mt: 2 }}
                >
                  {isUpdating ? 'กำลังอัพเดท...' : 'อัพเดทสถานะ'}
                </Button>
              </Box>
            )}
          {tabValue === 2 &&
            !(userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'site user') && (
              <Typography color="error" mt={2}>
                คุณไม่มีสิทธิ์ในการอัพเดทสถานะ
              </Typography>
            )}
          {tabValue === 3 && (
            <FileManagement
              componentId={component.id}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarOpen={setSnackbarOpen}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
});

export default ComponentDialog;
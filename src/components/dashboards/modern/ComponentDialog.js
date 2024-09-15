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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  fetchComponentById,
  fetchUserProfile,
  updateComponentStatus,
  fetchUserById,
  fetchComponentFiles,
  openFile,
} from 'src/utils/api';
import ComponentDetails from './ComponentDetails';
import FileManagement from './FileManagement';

const ComponentDialog = memo(({ open, onClose, component, onComponentUpdate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [componentDetails, setComponentDetails] = useState(null);
  const [componentFiles, setComponentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusDisplayMap = {
    planning: 'แผนผลิต',
    manufactured: 'ผลิตแล้ว',
    in_transit: 'อยู่ระหว่างขนส่ง',
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
        const [details, files] = await Promise.all([
          fetchComponentById(component.id),
          fetchComponentFiles(component.id)
        ]);
        setComponentDetails(details);
        setComponentFiles(files);
        
        // Attempt to fetch user profile
        try {
          const userProfile = await fetchUserProfile();
          setUserRole(userProfile.role);
          setIsAuthenticated(true);
        } catch (userError) {
          console.error('Error fetching user profile:', userError);
          setIsAuthenticated(false);
        }

        // Fetch usernames for history items only if authenticated
        if (isAuthenticated && details.history) {
          const historyWithUsernames = await Promise.all(
            details.history.map(async (item) => {
              try {
                const user = await fetchUserById(item.updated_by);
                return { ...item, username: user.username };
              } catch (error) {
                console.error('Error fetching user:', error);
                return { ...item, username: 'Unknown' };
              }
            })
          );
          setComponentDetails({ ...details, history: historyWithUsernames });
        }

        setNewStatus(details.status);
      } catch (error) {
        console.error('Error fetching component details or files:', error);
        setError('ไม่สามารถโหลดข้อมูลชิ้นงานหรือไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchDetails();
    }
  }, [open, component, isAuthenticated]);

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
    if (!isAuthenticated) {
      setSnackbarMessage('คุณต้องเข้าสู่ระบบเพื่อทำการอัพเดทสถานะ');
      setSnackbarOpen(true);
      return;
    }
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
      onComponentUpdate(updatedDetails);
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbarMessage(error.message || 'ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่');
      setSnackbarOpen(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileOpen = async (fileUrl) => {
    try {
      await openFile(fileUrl);
    } catch (error) {
      console.error('Error opening file:', error);
      setSnackbarMessage('ไม่สามารถเปิดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const canEdit = isAuthenticated && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'site user');

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียด: {componentDetails?.name}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="รายละเอียดชิ้นงาน" />
            <Tab label="ประวัติสถานะ" />
            <Tab label="ไฟล์" />
            {canEdit && <Tab label="อัพเดทสถานะ" />}
            {canEdit && <Tab label="จัดการไฟล์" />}
          </Tabs>
          {tabValue === 0 && componentDetails && (
            <ComponentDetails 
              componentId={component.id}
              componentDetails={componentDetails}
              userRole={userRole}
              onUpdate={(updatedDetails) => {
                setComponentDetails(updatedDetails);
                onComponentUpdate(updatedDetails);
              }}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarOpen={setSnackbarOpen}
              canEdit={canEdit}
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
                    <TableCell>วันที่อัพเดต</TableCell>
                    <TableCell>อัพเดตโดย</TableCell>
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
          {tabValue === 2 && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                ไฟล์ที่เกี่ยวข้อง
              </Typography>
              <List>
                {componentFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`Revision ${file.revision}`} 
                      secondary={new Date(file.created_at).toLocaleString('th-TH')}
                    />
                    <Button onClick={() => handleFileOpen(file.s3_url)}>
                      เปิดไฟล์
                    </Button>
                  </ListItem>
                ))}
              </List>
              {componentFiles.length === 0 && (
                <Typography>ไม่มีไฟล์ที่เกี่ยวข้อง</Typography>
              )}
            </Box>
          )}
          {tabValue === 3 && canEdit && (
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
          {tabValue === 4 && canEdit && (
            <FileManagement
              componentId={component.id}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarOpen={setSnackbarOpen}
              files={componentFiles}
              onFilesUpdate={setComponentFiles}
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
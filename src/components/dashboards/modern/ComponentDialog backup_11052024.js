import React, { useState, useEffect, useCallback, memo } from 'react';
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
  useMediaQuery,
  useTheme,
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

// Constants
const STATUS_DISPLAY_MAP = {
  planning: 'แผนผลิต',
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  accepted: 'ตรวจรับแล้ว',
  installed: 'ติดตั้งแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

const ComponentDialog = memo(({ open, onClose, component, projectCode, onComponentUpdate, canEdit }) => {
  // State management
  const [state, setState] = useState({
    tabValue: 0,
    componentDetails: null,
    componentFiles: [],
    loading: true,
    error: null,
    userRole: '',
    isAuthenticated: false,
    newStatus: '',
    isUpdating: false,
    snackbarOpen: false,
    snackbarMessage: '',
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Handlers
  const handleSnackbarClose = useCallback(() => {
    setState(prev => ({ ...prev, snackbarOpen: false }));
  }, []);

  const showSnackbar = useCallback((message) => {
    setState(prev => ({
      ...prev,
      snackbarMessage: message,
      snackbarOpen: true,
    }));
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setState(prev => ({ ...prev, tabValue: newValue }));
  }, []);

  const handleStatusChange = useCallback((event) => {
    setState(prev => ({ ...prev, newStatus: event.target.value }));
  }, []);

  const handleStatusUpdate = useCallback(async () => {
    if (!state.isAuthenticated) {
      showSnackbar('คุณต้องเข้าสู่ระบบเพื่อทำการอัพเดทสถานะ');
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      if (!state.newStatus) {
        throw new Error('กรุณาเลือกสถานะ');
      }

      await updateComponentStatus(component.id, state.newStatus);
      const updatedDetails = await fetchComponentById(component.id);
      
      setState(prev => ({
        ...prev,
        componentDetails: updatedDetails,
        isUpdating: false,
      }));

      showSnackbar('อัพเดทสถานะเรียบร้อยแล้ว');
      
      if (onComponentUpdate) {
        onComponentUpdate(updatedDetails);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar(error.message || 'ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่');
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [component?.id, state.newStatus, state.isAuthenticated, onComponentUpdate, showSnackbar]);

  const handleFileOpen = useCallback(async (fileUrl) => {
    try {
      await openFile(fileUrl);
    } catch (error) {
      console.error('Error opening file:', error);
      showSnackbar('ไม่สามารถเปิดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  }, [showSnackbar]);

  // Data fetching
  useEffect(() => {
    if (!open || !component?.id) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Parallel data fetching
        const [details, files, userProfile] = await Promise.all([
          fetchComponentById(component.id, { signal }),
          fetchComponentFiles(component.id, { signal }),
          fetchUserProfile().catch(() => null)
        ]);

        // Process user authentication
        const isAuthenticated = !!userProfile;
        const userRole = userProfile?.role || '';

        // If authenticated, fetch usernames for history
        let processedDetails = details;
        if (isAuthenticated && details.history) {
          const historyWithUsernames = await Promise.all(
            details.history.map(async (item) => {
              try {
                const user = await fetchUserById(item.updated_by);
                return { ...item, username: user.username };
              } catch (error) {
                return { ...item, username: 'Unknown' };
              }
            })
          );
          processedDetails = { ...details, history: historyWithUsernames };
        }

        setState(prev => ({
          ...prev,
          componentDetails: processedDetails,
          componentFiles: files,
          loading: false,
          isAuthenticated,
          userRole,
          newStatus: processedDetails.status,
        }));
      } catch (error) {
        if (!signal.aborted) {
          setState(prev => ({
            ...prev,
            error: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่',
            loading: false,
          }));
        }
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [open, component?.id]);

  // Early return for loading and error states
  if (!open) return null;

  if (state.loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (state.error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Alert severity="error">{state.error}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (state.tabValue) {
      case 0:
        return (
          <ComponentDetails 
            componentId={component.id}
            componentDetails={state.componentDetails}
            userRole={state.userRole}
            onUpdate={(updatedDetails) => {
              setState(prev => ({ ...prev, componentDetails: updatedDetails }));
              if (onComponentUpdate) {
                onComponentUpdate(updatedDetails);
              }
            }}
            setSnackbarMessage={(message) => showSnackbar(message)}
            setSnackbarOpen={(open) => setState(prev => ({ ...prev, snackbarOpen: open }))}
            canEdit={canEdit}
          />
        );
      case 1:
        return (
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
                {state.componentDetails?.history?.map((historyItem, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {STATUS_DISPLAY_MAP[historyItem.status] || historyItem.status}
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
        );
      case 2:
        return (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              ไฟล์ที่เกี่ยวข้อง
            </Typography>
            <List>
              {state.componentFiles.map((file, index) => (
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
            {state.componentFiles.length === 0 && (
              <Typography>ไม่มีไฟล์ที่เกี่ยวข้อง</Typography>
            )}
          </Box>
        );
      case 3:
        return canEdit && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              อัพเดทสถานะ
            </Typography>
            <Select 
              value={state.newStatus} 
              onChange={handleStatusChange} 
              fullWidth 
              margin="normal"
            >
              {Object.entries(STATUS_DISPLAY_MAP).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStatusUpdate}
              disabled={state.isUpdating}
              sx={{ mt: 2 }}
            >
              {state.isUpdating ? 'กำลังอัพเดท...' : 'อัพเดทสถานะ'}
            </Button>
          </Box>
        );
      case 4:
        return canEdit && (
          <FileManagement
            componentId={component.id}
            setSnackbarMessage={showSnackbar}
            setSnackbarOpen={(open) => setState(prev => ({ ...prev, snackbarOpen: open }))}
            files={state.componentFiles}
            onFilesUpdate={(files) => setState(prev => ({ ...prev, componentFiles: files }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        TransitionProps={{
          onExited: () => setState(prev => ({ ...prev, tabValue: 0 }))
        }}
      >
        <DialogTitle>
          รายละเอียด: {state.componentDetails?.name}
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={state.tabValue} 
            onChange={handleTabChange}
            variant={isSmallScreen ? "scrollable" : "standard"}
            scrollButtons={isSmallScreen ? "auto" : "auto"}
            allowScrollButtonsMobile
          >
            <Tab label="รายละเอียดชิ้นงาน" />
            <Tab label="ประวัติสถานะ" />
            <Tab label="ไฟล์" />
            {canEdit && <Tab label="อัพเดทสถานะ" />}
            {canEdit && <Tab label="จัดการไฟล์" />}
          </Tabs>
          {renderTabContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={state.snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {state.snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
});

export default ComponentDialog;
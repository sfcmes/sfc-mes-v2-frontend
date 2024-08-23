import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import { fetchComponentById, updateComponentStatus } from 'src/utils/api';
import { useAuth } from 'src/contexts/AuthContext'; // Import the AuthContext

const ComponentDetailsPage = () => {
  console.log('ComponentDetailsPage rendered');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const checkAuthAndLoadComponent = async () => {
      if (!user) {
        // Redirect to login page
        navigate('/login', { state: { from: `/component/${id}` } });
        return;
      }
      loadComponentDetails();
    };

    checkAuthAndLoadComponent();
  }, [id, user, navigate]);

  const loadComponentDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchComponentById(id);
      setComponent(data);
      setNewStatus(data.status); // Set current status as default
    } catch (err) {
      setError('Failed to load component details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setOpenConfirmDialog(true);
  };
  
  const handleConfirmStatusUpdate = async () => {
    setOpenConfirmDialog(false);
    await updateStatus();
  };

  const updateStatus = async () => {
    try {
      await updateComponentStatus(id, newStatus);
      await loadComponentDetails(); // Reload component details
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      setError('Failed to update status');
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
      console.error(err);
    }
  };

  const handleConfirmReject = async () => {
    setOpenConfirmDialog(false);
    await updateStatus();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setNewStatus(component.status); // Reset to current status
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!component) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>No component found</Typography>
      </Box>
    );
  }

  const getStatusOptions = () => {
    const baseOptions = ['Planning', 'In Progress', 'Completed'];
    if (user.role === 'Transporter' && component.status === 'อยู่ระหว่างขนส่ง') {
      return ['ส่งชิ้นงานแล้ว', 'Reject'];
    } else if (user.role === 'Site User') {
      if (component.status === 'ขนส่งแล้ว') {
        return ['Accept', 'Reject'];
      } else if (component.status === 'Accept') {
        return ['ติดตั้งแล้ว', 'Reject'];
      }
    }
    return baseOptions;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Component Details
        </Typography>
        <Typography>Name: {component.name}</Typography>
        <Typography>Type: {component.type}</Typography>
        <Typography>Width: {component.width} mm</Typography>
        <Typography>Height: {component.height} mm</Typography>
        <Typography>Current Status: {component.status}</Typography>

        <Box sx={{ mt: 2 }}>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Select new status
            </MenuItem>
            {getStatusOptions().map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={handleStatusUpdate}
            disabled={!newStatus || newStatus === component.status}
            sx={{ mt: 1 }}
          >
            Update Status
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Files:
        </Typography>
        <List>
          {component.files &&
            component.files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Link href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.name}
                    </Link>
                  }
                />
              </ListItem>
            ))}
        </List>
      </Paper>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirm Status Update'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to update the status to {newStatus}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmStatusUpdate} autoFocus>
            Confirm Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComponentDetailsPage;

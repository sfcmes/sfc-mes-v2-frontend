import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, Button, TextField, Select, MenuItem, FormControl, InputLabel, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Typography, Snackbar, Alert
} from '@mui/material';
import { 
  fetchProjects, 
  updateOtherComponentDetails, 
  deleteOtherComponentById,
  fetchOtherComponentsByProjectIdV2
} from 'src/utils/api';
import { AuthContext } from 'src/contexts/AuthContext';

const OtherComponentManager = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedComponent, setEditedComponent] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchProjects().then(response => setProjects(response.data));
  }, []);

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    try {
      const projectComponents = await fetchOtherComponentsByProjectIdV2(projectId);
      setComponents(projectComponents);
    } catch (error) {
      console.error('Error fetching other components:', error);
      setComponents([]);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลชิ้นส่วน', severity: 'error' });
    }
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setEditedComponent({ ...component });
  };

  const handleEditComponent = () => {
    setIsEditing(true);
  };

  const handleUpdateComponent = async () => {
    try {
      if (!user || !user.id) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
  
      const updatedComponent = await updateOtherComponentDetails(editedComponent.id, {
        ...editedComponent,
        updated_by: user.id,
        resetStatuses: editedComponent.total_quantity !== selectedComponent.total_quantity
      });
  
      const updatedComponents = components.map(c => 
        c.id === updatedComponent.id ? updatedComponent : c
      );
      setComponents(updatedComponents);
      setSelectedComponent(updatedComponent);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'อัปเดตชิ้นส่วนสำเร็จ', severity: 'success' });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตชิ้นส่วน:', error);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการอัปเดตชิ้นส่วน', severity: 'error' });
    }
  };

  const handleDeleteComponent = () => {
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteOtherComponentById(selectedComponent.id);
      setComponents(components.filter(c => c.id !== selectedComponent.id));
      setSelectedComponent(null);
      setIsDeleting(false);
      setSnackbar({ open: true, message: 'ลบชิ้นส่วนสำเร็จ', severity: 'success' });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลบชิ้นส่วน:', error);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการลบชิ้นส่วน', severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>เลือกโครงการ</InputLabel>
          <Select value={selectedProject} onChange={(e) => handleProjectChange(e.target.value)}>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ</TableCell>
                <TableCell>จำนวนทั้งหมด</TableCell>
                <TableCell>การดำเนินการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell>{component.total_quantity}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleComponentSelect(component)}>เลือก</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {selectedComponent && (
        <Grid item xs={12}>
          <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>
              ชิ้นส่วนที่เลือก: {selectedComponent.name}
            </Typography>
            {isEditing ? (
              <>
                <TextField
                  label="ชื่อ"
                  value={editedComponent.name}
                  onChange={(e) => setEditedComponent({ ...editedComponent, name: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="จำนวนทั้งหมด"
                  type="number"
                  value={editedComponent.total_quantity}
                  onChange={(e) => setEditedComponent({ ...editedComponent, total_quantity: parseInt(e.target.value, 10) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="ความกว้าง"
                  type="number"
                  value={editedComponent.width}
                  onChange={(e) => setEditedComponent({ ...editedComponent, width: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="ความสูง"
                  type="number"
                  value={editedComponent.height}
                  onChange={(e) => setEditedComponent({ ...editedComponent, height: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="ความหนา"
                  type="number"
                  value={editedComponent.thickness}
                  onChange={(e) => setEditedComponent({ ...editedComponent, thickness: parseFloat(e.target.value) })}
                  fullWidth
                  margin="normal"
                />
                <Button onClick={handleUpdateComponent}>บันทึกการเปลี่ยนแปลง</Button>
                <Button onClick={() => setIsEditing(false)}>ยกเลิก</Button>
              </>
            ) : (
              <>
                <Typography>จำนวนทั้งหมด: {selectedComponent.total_quantity}</Typography>
                <Typography>ความกว้าง: {selectedComponent.width}</Typography>
                <Typography>ความสูง: {selectedComponent.height}</Typography>
                <Typography>ความหนา: {selectedComponent.thickness}</Typography>
                <Typography variant="h6" gutterBottom>สถานะ:</Typography>
                {Object.entries(selectedComponent.statuses).map(([status, quantity]) => (
                  <Typography key={status}>{status}: {quantity}</Typography>
                ))}
                <Button onClick={handleEditComponent}>แก้ไข</Button>
                <Button onClick={handleDeleteComponent}>ลบ</Button>
              </>
            )}
          </Paper>
        </Grid>
      )}
      <Dialog
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
      >
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ว่าต้องการลบชิ้นส่วนนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>ยกเลิก</Button>
          <Button onClick={confirmDelete} color="error">ลบ</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default OtherComponentManager;
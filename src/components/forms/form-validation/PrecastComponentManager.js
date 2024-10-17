import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import CustomTextField from '../theme-elements/CustomTextField';
import { fetchComponentsByProjectId, updateComponent, deleteComponent } from 'src/utils/api';

const PrecastComponentManager = ({ projects, sections, onProjectChange }) => {
  const [selectedProject, setSelectedProject] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    try {
      const fetchedComponents = await fetchComponentsByProjectId(projectId);
      setComponents(fetchedComponents.filter(c => c.type === 'precast'));
    } catch (error) {
      console.error('Error fetching precast components:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลชิ้นงาน');
    }
  };

  const handleComponentSelect = (component) => {
    setSelectedComponent(component);
    setIsEditing(true);
  };

  const handleUpdateComponent = async (values) => {
    try {
      const updatedComponent = await updateComponent(selectedComponent.id, values);
      setComponents(components.map(c => c.id === updatedComponent.id ? updatedComponent : c));
      setSuccess('อัปเดตชิ้นงานสำเร็จ');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating component:', error);
      setError('เกิดข้อผิดพลาดในการอัปเดตชิ้นงาน');
    }
  };

  const handleDeleteComponent = () => {
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteComponent(selectedComponent.id);
      setComponents(components.filter(c => c.id !== selectedComponent.id));
      setSuccess('ลบชิ้นงานสำเร็จ');
      setIsDeleting(false);
      setSelectedComponent(null);
    } catch (error) {
      console.error('Error deleting component:', error);
      setError('เกิดข้อผิดพลาดในการลบชิ้นงาน');
    }
  };

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <FormControl fullWidth>
        <InputLabel id="project-select-label">โครงการ</InputLabel>
        <Select
          labelId="project-select-label"
          value={selectedProject}
          onChange={(e) => handleProjectSelect(e.target.value)}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อ</TableCell>
              <TableCell>ขนาด (กxยxส)</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>การดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {components.map((component) => (
              <TableRow key={component.id}>
                <TableCell>{component.name}</TableCell>
                <TableCell>{`${component.width}x${component.height}x${component.thickness}`}</TableCell>
                <TableCell>{component.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleComponentSelect(component)}>แก้ไข</Button>
                  <Button onClick={() => handleDeleteComponent(component)}>ลบ</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isEditing && selectedComponent && (
        <Box>
          <Typography variant="h6">แก้ไขชิ้นงาน: {selectedComponent.name}</Typography>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateComponent(selectedComponent);
          }}>
            <Stack spacing={2}>
              <CustomTextField
                fullWidth
                id="componentName"
                name="name"
                label="ชื่อชิ้นงาน"
                value={selectedComponent.name}
                onChange={(e) => setSelectedComponent({...selectedComponent, name: e.target.value})}
              />
              <CustomTextField
                fullWidth
                id="width"
                name="width"
                label="ความกว้าง (มม.)"
                type="number"
                value={selectedComponent.width}
                onChange={(e) => setSelectedComponent({...selectedComponent, width: e.target.value})}
              />
              <CustomTextField
                fullWidth
                id="height"
                name="height"
                label="ความสูง (มม.)"
                type="number"
                value={selectedComponent.height}
                onChange={(e) => setSelectedComponent({...selectedComponent, height: e.target.value})}
              />
              <CustomTextField
                fullWidth
                id="thickness"
                name="thickness"
                label="ความหนา (มม.)"
                type="number"
                value={selectedComponent.thickness}
                onChange={(e) => setSelectedComponent({...selectedComponent, thickness: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel id="status-label">สถานะ</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={selectedComponent.status}
                  onChange={(e) => setSelectedComponent({...selectedComponent, status: e.target.value})}
                >
                  <MenuItem value="planning">แผนผลิต</MenuItem>
                  <MenuItem value="manufactured">ผลิตแล้ว</MenuItem>
                  <MenuItem value="in_transit">อยู่ระหว่างขนส่ง</MenuItem>
                  <MenuItem value="installed">ติดตั้งแล้ว</MenuItem>
                  <MenuItem value="rejected">ถูกปฏิเสธ</MenuItem>
                </Select>
              </FormControl>
              <Box mt={2}>
                <Button type="submit" variant="contained" color="primary">บันทึกการเปลี่ยนแปลง</Button>
                <Button onClick={() => setIsEditing(false)}>ยกเลิก</Button>
              </Box>
            </Stack>
          </form>
        </Box>
      )}

      <Dialog
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
      >
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณแน่ใจหรือไม่ว่าต้องการลบชิ้นงานนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleting(false)}>ยกเลิก</Button>
          <Button onClick={confirmDelete} color="error">ลบ</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PrecastComponentManager;
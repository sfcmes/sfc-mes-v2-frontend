import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import { fetchComponentById, updateComponent, uploadComponentFile } from 'src/utils/api';
import { format } from 'date-fns';

const ComponentDetails = ({ componentId, userRole, onUpdate, setSnackbarMessage, setSnackbarOpen }) => {
  const [componentDetails, setComponentDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileRevisions, setFileRevisions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const fieldNameMap = {
    id: 'รหัสชิ้นงาน',
    section_id: 'รหัสชั้น',
    name: 'ชื่อชิ้นงาน',
    type: 'ประเภทชิ้นงาน',
    width: 'ความกว้าง (มม.)',
    height: 'ความสูง (มม.)',
    thickness: 'ความหนา (มม.)',
    extension: 'ส่วนขยาย (ตร.ม.)',
    reduction: 'ส่วนลด (ตร.ม.)',
    area: 'พื้นที่ (ตร.ม.)',
    volume: 'ปริมาตร (ลบ.ม.)',
    weight: 'น้ำหนัก',
    created_at: 'สร้างเมื่อ',
    updated_at: 'อัปเดตเมื่อ',
    status: 'สถานะ',
  };

  const statusDisplayMap = {
    planning: 'แผนผลิต',
    manufactured: 'ผลิตแล้ว',
    // in_transit: 'อยู่ระหว่างขนส่ง',
    transported: 'ขนส่งสำเร็จ',
    accepted: 'ตรวจรับแล้ว',
    installed: 'ติดตั้งแล้ว',
    rejected: 'ถูกปฏิเสธ',
  };

  const editableFields = ['name', 'type', 'width', 'height', 'thickness', 'extension', 'reduction', 'area', 'volume', 'weight'];

  useEffect(() => {
    fetchDetails();
  }, [componentId]);

  const fetchDetails = async () => {
    if (!componentId) {
      setError('No component ID provided');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const details = await fetchComponentById(componentId);
      setComponentDetails(details);
      setEditedDetails(details);
      setFileRevisions(details.file_revisions || []);
    } catch (err) {
      console.error('Error fetching component details:', err);
      setError('Failed to load component details. Please try again.');
      if (setSnackbarMessage && setSnackbarOpen) {
        setSnackbarMessage('Failed to load component details. Please try again.');
        setSnackbarOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSave = async () => {
    try {
        setIsLoading(true);
        const dataToSend = {};
        editableFields.forEach(field => {
            if (editedDetails[field] !== undefined) {
                dataToSend[field] = editedDetails[field];
            }
        });
        console.log('Sending updated details:', dataToSend);
        const updatedComponent = await updateComponent(componentId, dataToSend);
        console.log('Received updated component:', updatedComponent);
        
        if (updatedComponent) {
            setComponentDetails(updatedComponent);
            setEditedDetails(updatedComponent);
            setIsEditing(false);
            if (setSnackbarMessage && setSnackbarOpen) {
                setSnackbarMessage('ข้อมูลชิ้นงานถูกอัปเดตเรียบร้อยแล้ว');
                setSnackbarOpen(true);
            }
            if (onUpdate) {
                onUpdate(updatedComponent);  // Ensure this line passes the updated component
            }
        } else {
            throw new Error('Unexpected response format from server');
        }
    
        if (selectedFile) {
            await handleFileUpload();
        }
    } catch (err) {
        console.error('Error updating component details:', err);
        if (setSnackbarMessage && setSnackbarOpen) {
            setSnackbarMessage('ไม่สามารถอัปเดตข้อมูลชิ้นงานได้ กรุณาลองใหม่อีกครั้ง');
            setSnackbarOpen(true);
        }
    } finally {
        setIsLoading(false);
        setSelectedFile(null);
        await fetchDetails(); // Refresh the component details
    }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadComponentFile(selectedFile, componentId);
      setFileRevisions(prevRevisions => [...prevRevisions, result.file]);
      setSnackbarMessage('อัปโหลดไฟล์สำเร็จ');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbarMessage('ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
      setSnackbarOpen(true);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!componentDetails) return <Typography>ไม่พบข้อมูลชิ้นงาน</Typography>;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>รายละเอียดชิ้นงาน</Typography>
        </Grid>
        <Grid item xs={12}>
          <Table>
            <TableBody>
              {Object.entries(componentDetails).map(([key, value]) => {
                if (key !== 'history' && typeof value !== 'object') {
                  return (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row">
                        {fieldNameMap[key] || key}
                      </TableCell>
                      <TableCell>
                        {isEditing && editableFields.includes(key) ? (
                          <TextField
                            name={key}
                            value={editedDetails[key] || ''}
                            onChange={handleInputChange}
                            fullWidth
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          key === 'created_at' || key === 'updated_at'
                            ? format(new Date(value), 'dd/MM/yyyy HH:mm:ss')
                            : key === 'status'
                              ? statusDisplayMap[value] || value
                              : value.toString()
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
                return null;
              })}
            </TableBody>
          </Table>
        </Grid>
        {fileRevisions.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>ประวัติไฟล์</Typography>
            <Table>
              <TableBody>
                {fileRevisions.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell>{file.file_name || 'Unknown'}</TableCell>
                    <TableCell>เวอร์ชัน {file.revision}</TableCell>
                    <TableCell>{format(new Date(file.created_at), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={2}>
            {userRole && ['admin', 'site user'].includes(userRole.toLowerCase()) && (
              <>
                {isEditing ? (
                  <>
                    <input
                      accept="*/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="raised-button-file">
                      <Button variant="outlined" component="span">
                        อัปโหลดไฟล์
                      </Button>
                    </label>
                    {selectedFile && (
                      <Typography variant="body2">
                        ไฟล์ที่เลือก: {selectedFile.name}
                      </Typography>
                    )}
                    <Box display="flex" gap={2} mt={2}>
                      <Button variant="contained" color="primary" onClick={handleEditSave}>
                        บันทึก
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                        ยกเลิก
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                    แก้ไข
                  </Button>
                )}
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ComponentDetails;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { fetchRejectedComponentsHistory } from 'src/utils/api';

const RejectedComponentsDialog = ({ open, onClose, onComponentClick, sectionId, sectionName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectedComponents, setRejectedComponents] = useState([]);

  useEffect(() => {
    const loadRejectedComponents = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const data = await fetchRejectedComponentsHistory(sectionId);
        setRejectedComponents(data);
        setError(null);
      } catch (err) {
        console.error('Error loading rejected components:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
      } finally {
        setLoading(false);
      }
    };

    loadRejectedComponents();
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            รายการชิ้นงานที่เคยถูกปฏิเสธ {sectionName ? `- ชั้น ${sectionName}` : ''}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อชิ้นงาน</TableCell>
                <TableCell>สถานะปัจจุบัน</TableCell>
                <TableCell>วันที่ปฏิเสธ</TableCell>
                <TableCell>ผู้ปฏิเสธ</TableCell>
                <TableCell>หมายเหตุ</TableCell>
                <TableCell>สถานะหลังปฏิเสธ</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rejectedComponents.map((component) => (
                <TableRow key={component.id}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={component.current_status} 
                      color={component.current_status === 'rejected' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(component.rejection_history[0].rejected_at).toLocaleString('th-TH')}
                  </TableCell>
                  <TableCell>{component.rejection_history[0].rejected_by}</TableCell>
                  <TableCell>{component.rejection_history[0].notes || '-'}</TableCell>
                  <TableCell>
                    {component.rejection_history[0].current_status_after_rejection && (
                      <>
                        <Chip 
                          label={component.rejection_history[0].current_status_after_rejection}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary" display="block">
                          {new Date(component.rejection_history[0].status_changed_at).toLocaleString('th-TH')}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onComponentClick(component)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rejectedComponents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>ไม่พบข้อมูล</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RejectedComponentsDialog;

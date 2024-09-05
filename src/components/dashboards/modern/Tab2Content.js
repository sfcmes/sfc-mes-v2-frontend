import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  IconButton,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Chart from 'react-apexcharts';
import { fetchProjectsWithOtherComponents, updateOtherComponentStatus } from 'src/utils/api';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.8rem',
  },
}));

const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  transported: '#ffc658',
  rejected: '#ff6b6b'
};

const STATUS_THAI = {
  planning: 'วางแผน',
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  rejected: 'ถูกปฏิเสธ',
};

const getStatusColor = (status) => {
  return { bg: COLORS[status], color: '#ffffff' };
};

const DoughnutChart = ({ data, status }) => {
  const theme = useTheme();
  const { bg, color } = getStatusColor(status);
  
  const statusQuantity = data.statuses[status] || 0;
  const percentage = ((statusQuantity / data.total) * 100).toFixed(1);

  const options = {
    chart: {
      type: 'donut',
    },
    labels: [STATUS_THAI[status], 'อื่นๆ'],
    colors: [bg, theme.palette.grey[300]],
    legend: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: STATUS_THAI[status],
              color: bg,
              formatter: function (w) {
                return percentage + '%'
              }
            },
            value: {
              color: bg,
              formatter: function (val) {
                return val;
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value + ' ชิ้น';
        }
      }
    }
  };

  const series = [statusQuantity, data.total - statusQuantity];

  return (
    <Chart options={options} series={series} type="donut" width="100%" height={200} />
  );
};

const ComponentRow = memo(({ component, isLoggedIn, onUpdateStatus }) => {
  const [open, setOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    fromStatus: '',
    toStatus: '',
    quantity: 0
  });
  const [error, setError] = useState('');

  const handleStatusUpdate = useCallback((e) => {
    e.preventDefault();
    const { fromStatus, toStatus, quantity } = statusUpdate;
    
    if (quantity <= 0 || quantity > (component.statuses[fromStatus] || 0)) {
      setError('จำนวนไม่ถูกต้อง');
      return;
    }

    onUpdateStatus(component.id, fromStatus, toStatus, quantity)
      .then(() => {
        setStatusUpdate({ fromStatus: '', toStatus: '', quantity: 0 });
        setError('');
      })
      .catch(err => {
        setError('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      });
  }, [statusUpdate, component, onUpdateStatus]);

  const statusOrder = ['planning', 'manufactured', 'transported', 'rejected'];

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{component.name}</TableCell>
        <TableCell align="right">{component.total}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Grid container spacing={2}>
                {statusOrder.map((status) => (
                  <Grid item xs={12} sm={3} key={status}>
                    <Typography variant="subtitle1" gutterBottom style={{ color: COLORS[status], fontWeight: 'bold' }}>
                      {STATUS_THAI[status]}: {component.statuses[status] || 0}
                    </Typography>
                    <DoughnutChart data={component} status={status} />
                  </Grid>
                ))}
              </Grid>
              {isLoggedIn && (
                <form onSubmit={handleStatusUpdate}>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>จากสถานะ</InputLabel>
                        <Select
                          value={statusUpdate.fromStatus}
                          onChange={(e) => setStatusUpdate(prev => ({ ...prev, fromStatus: e.target.value }))}
                        >
                          {statusOrder.map((status) => (
                            <MenuItem key={status} value={status}>{STATUS_THAI[status]}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>ไปยังสถานะ</InputLabel>
                        <Select
                          value={statusUpdate.toStatus}
                          onChange={(e) => setStatusUpdate(prev => ({ ...prev, toStatus: e.target.value }))}
                        >
                          {statusOrder.map((status) => (
                            <MenuItem key={status} value={status}>{STATUS_THAI[status]}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="text"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        label="จำนวน"
                        value={statusUpdate.quantity}
                        onChange={(e) => setStatusUpdate(prev => ({ ...prev, quantity: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                        อัปเดตสถานะ
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
              {error && <Typography color="error" style={{ marginTop: '10px' }}>{error}</Typography>}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const ProjectRowTab2 = memo(({ project, isLoggedIn, onUpdateStatus }) => {
  const [open, setOpen] = useState(false);

  if (!project.components || project.components.length === 0) {
    return null;
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{project.project_code}</TableCell>
        <TableCell>{project.name}</TableCell>
        <TableCell align="right">{project.components.length}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชิ้นงานอื่นๆ
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>ชื่อชิ้นงาน</TableCell>
                    <TableCell align="right">จำนวนทั้งหมด</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project.components.map((component) => (
                    <ComponentRow 
                      key={component.id} 
                      component={component} 
                      isLoggedIn={isLoggedIn}
                      onUpdateStatus={onUpdateStatus} 
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const Tab2Content = memo(({ isSmallScreen }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectsWithOtherComponents();
        setProjects(data);
        setIsLoggedIn(!!localStorage.getItem('token'));
      } catch (err) {
        console.error('Error fetching projects with other components:', err);
        setError('Failed to fetch projects with other components');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleUpdateStatus = useCallback(async (componentId, fromStatus, toStatus, quantity) => {
    if (!isLoggedIn) {
      setSnackbar({ open: true, message: 'คุณต้องเข้าสู่ระบบเพื่อทำการอัปเดต', severity: 'warning' });
      return;
    }
    try {
      const updatedComponent = await updateOtherComponentStatus(componentId, fromStatus, toStatus, parseInt(quantity, 10));
      setProjects(prevProjects => 
        prevProjects.map(project => ({
          ...project,
          components: project.components.map(comp => 
            comp.id === componentId ? { ...comp, statuses: updatedComponent.statuses } : comp
          )
        }))
      );
      setSnackbar({ open: true, message: 'สถานะอัปเดตเรียบร้อยแล้ว', severity: 'success' });
    } catch (err) {
      console.error('Failed to update status:', err);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ', severity: 'error' });
    }
  }, [isLoggedIn]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="300px"><Typography>กำลังโหลด...</Typography></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" height="300px"><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <TableContainer>
        <Table aria-label="collapsible table" size={isSmallScreen ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <StyledTableCell />
              <StyledTableCell>รหัสโครงการ</StyledTableCell>
              <StyledTableCell>ชื่อโครงการ</StyledTableCell>
              <StyledTableCell align="right">จำนวนชิ้นงานอื่นๆ</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <ProjectRowTab2 
                key={project.id} 
                project={project} 
                isLoggedIn={isLoggedIn}
                onUpdateStatus={handleUpdateStatus} 
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {projects.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <Typography>ไม่พบโครงการที่มีชิ้นงานอื่นๆ</Typography>
        </Box>
      )}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default Tab2Content;
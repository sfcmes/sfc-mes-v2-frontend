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
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
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
    fontSize: '0.75rem',
  },
}));

const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  transported: '#ffc658',
  rejected: '#ff6b6b',
};

const STATUS_THAI = {
  planning: 'รอผลิต',
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  rejected: 'ถูกปฏิเสธ',
};

const getStatusColor = (status) => {
  return { bg: COLORS[status], color: '#ffffff' };
};

const DoughnutChart = memo(({ data, status, isSmallScreen }) => {
  const theme = useTheme();
  const { bg, color } = getStatusColor(status);

  const statusQuantity = data.statuses[status] || 0;
  let totalForPercentage = data.total;
  
  // ปรับการคำนวณเปอร์เซ็นต์สำหรับ manufactured และ transported
  if (status === 'manufactured' || status === 'transported') {
    totalForPercentage = Math.max(data.total, statusQuantity);
  }
  
  const percentage = ((statusQuantity / totalForPercentage) * 100).toFixed(1);

  const options = {
    chart: {
      type: 'donut',
    },
    labels: [STATUS_THAI[status], 'อื่นๆ'],
    colors: [bg, theme.palette.grey[300]],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            total: {
              show: true,
              label: STATUS_THAI[status],
              color: bg,
              fontSize: isSmallScreen ? '10px' : '14px',
              formatter: function (w) {
                return percentage + '%';
              },
            },
            value: {
              color: bg,
              fontSize: isSmallScreen ? '12px' : '16px',
              formatter: function (val) {
                return val;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return value + ' ชิ้น';
        },
      },
    },
  };

  const series = [statusQuantity, totalForPercentage - statusQuantity];

  return (
    <Chart options={options} series={series} type="donut" width="100%" height={isSmallScreen ? 120 : 150} />
  );
});

const ComponentRow = memo(({ component, isLoggedIn, onUpdateStatus, isSmallScreen, refreshData }) => {
  const [open, setOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    fromStatus: '',
    toStatus: '',
    quantity: 0,
  });
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = useCallback(
    (e) => {
      e.preventDefault();
      const { fromStatus, toStatus, quantity } = statusUpdate;

      const quantityNumber = parseInt(quantity, 10);
      if (
        isNaN(quantityNumber) ||
        quantityNumber <= 0 ||
        quantityNumber > (component.statuses[fromStatus] || 0)
      ) {
        setError('จำนวนไม่ถูกต้อง');
        return;
      }

      // ตรวจสอบว่าการอัพเดทไม่เกินความเป็นจริง (ยกเว้น manufactured และ transported)
      const currentTotal = Object.entries(component.statuses)
        .filter(([status]) => status !== 'manufactured' && status !== 'transported')
        .reduce((sum, [, value]) => sum + value, 0);
      if (fromStatus !== 'manufactured' && fromStatus !== 'transported' && 
          toStatus !== 'manufactured' && toStatus !== 'transported' && 
          currentTotal + quantityNumber > component.total) {
        setError('จำนวนรวมเกินกว่าจำนวนทั้งหมดของชิ้นงาน');
        return;
      }

      setIsUpdating(true);
      onUpdateStatus(component.id, fromStatus, toStatus, quantityNumber)
        .then(() => {
          setStatusUpdate({ fromStatus: '', toStatus: '', quantity: 0 });
          setError('');
          refreshData();
        })
        .catch((err) => {
          setError('เกิดข้อผิดพลาดในการอัพเดตสถานะ');
        })
        .finally(() => {
          setIsUpdating(false);
        });
    },
    [statusUpdate, component, onUpdateStatus, refreshData]
  );

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
              <Grid container spacing={isSmallScreen ? 1 : 2} justifyContent="center">
                {statusOrder.map((status) => (
                  <Grid item xs={6} sm={3} key={status}>
                    <Typography
                      variant={isSmallScreen ? 'caption' : 'subtitle2'}
                      gutterBottom
                      style={{ color: COLORS[status], fontWeight: 'bold' }}
                    >
                      {STATUS_THAI[status]}: {component.statuses[status] || 0}
                      {(status === 'manufactured' || status === 'transported') && 
                        ` (${(((component.statuses[status] || 0) / component.total) * 100).toFixed(1)}%)`}
                    </Typography>
                    <DoughnutChart data={component} status={status} isSmallScreen={isSmallScreen} />
                  </Grid>
                ))}
              </Grid>
              {isLoggedIn && (
                <form onSubmit={handleStatusUpdate}>
                  <Grid
                    container
                    spacing={isSmallScreen ? 1 : 2}
                    alignItems="flex-end"
                    sx={{ mt: 1 }}
                  >
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>จากสถานะ</InputLabel>
                        <Select
                          value={statusUpdate.fromStatus}
                          onChange={(e) =>
                            setStatusUpdate((prev) => ({ ...prev, fromStatus: e.target.value }))
                          }
                        >
                          {statusOrder.map((status) => (
                            <MenuItem key={status} value={status}>
                              {STATUS_THAI[status]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>ไปยังสถานะ</InputLabel>
                        <Select
                          value={statusUpdate.toStatus}
                          onChange={(e) =>
                            setStatusUpdate((prev) => ({ ...prev, toStatus: e.target.value }))
                          }
                        >
                          {statusOrder.map((status) => (
                            <MenuItem key={status} value={status}>
                              {STATUS_THAI[status]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        label="จำนวน"
                        value={statusUpdate.quantity}
                        onChange={(e) =>
                          setStatusUpdate((prev) => ({ ...prev, quantity: e.target.value }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="small"
                        disabled={isUpdating}
                      >
                        {isUpdating ? <CircularProgress size={24} /> : 'อัพเดตสถานะ'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
              {error && (
                <Typography
                  color="error"
                  style={{ marginTop: '10px', fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const ProjectRowTab2 = memo(
  ({
    project,
    isLoggedIn,
    onUpdateStatus,
    isSmallScreen,
    refreshData,
    userRole,
    onProjectSelect,
  }) => {
    const [open, setOpen] = useState(false);

    if (!project.components || project.components.length === 0) {
      return null;
    }

    const handleRowClick = () => {
      setOpen(!open);
      if (typeof onProjectSelect === 'function') {
        onProjectSelect(project);
      }
    };

    return (
      <>
        <TableRow
          sx={{
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              cursor: 'pointer',
            },
          }}
          onClick={handleRowClick}
        >
          <TableCell>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
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
                        isSmallScreen={isSmallScreen}
                        refreshData={refreshData}
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
  }
);

const Tab2Content = memo(({ onProjectSelect, isSmallScreen, userRole }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme();

  const loadProjects = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleUpdateStatus = useCallback(
    async (componentId, fromStatus, toStatus, quantity) => {
      if (!isLoggedIn) {
        setSnackbar({
          open: true,
          message: 'คุณต้องเข้าสู่ระบบเพื่อทำการอัพเดต',
          severity: 'warning',
        });
        return;
      }
      try {
        // อัพเดตสถานะผ่าน API
        await updateOtherComponentStatus(componentId, fromStatus, toStatus, parseInt(quantity, 10));
        
        // อัพเดตข้อมูลใน state โดยตรง
        setProjects(prevProjects => 
          prevProjects.map(project => ({
            ...project,
            components: project.components.map(component => {
              if (component.id === componentId) {
                const updatedStatuses = { ...component.statuses };
                
                // ลดจำนวนจากสถานะเดิม ยกเว้น manufactured
                if (fromStatus !== 'manufactured') {
                  updatedStatuses[fromStatus] = Math.max(0, (updatedStatuses[fromStatus] || 0) - quantity);
                }
                
                // เพิ่มจำนวนไปยังสถานะใหม่
                updatedStatuses[toStatus] = (updatedStatuses[toStatus] || 0) + quantity;
                
                // กรณีพิเศษสำหรับการเปลี่ยนจาก manufactured เป็น transported
                if (fromStatus === 'manufactured' && toStatus === 'transported') {
                  // ไม่ลดจำนวน manufactured
                  updatedStatuses['manufactured'] = (updatedStatuses['manufactured'] || 0);
                }
                
                return { ...component, statuses: updatedStatuses };
              }
              return component;
            })
          }))
        );
        
        setSnackbar({ open: true, message: 'สถานะอัพเดตเรียบร้อยแล้ว', severity: 'success' });
      } catch (err) {
        console.error('Failed to update status:', err);
        setSnackbar({
          open: true,
          message: err.message || 'เกิดข้อผิดพลาดในการอัพเดตสถานะ',
          severity: 'error',
        });
      }
    },
    [isLoggedIn, setProjects]
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );

  return (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto' }}>
      <TableContainer>
        <Table aria-label="collapsible table" size="small">
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
                isSmallScreen={isSmallScreen}
                refreshData={loadProjects}
                userRole={userRole}
                onProjectSelect={onProjectSelect}
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
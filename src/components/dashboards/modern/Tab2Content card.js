import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
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
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import Chart from 'react-apexcharts';
import { fetchProjectsWithOtherComponents, updateOtherComponentStatus } from 'src/utils/api';

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DoughnutChart = memo(({ data, status, isSmallScreen }) => {
  const theme = useTheme();
  const { bg, color } = getStatusColor(status);
  const [openPopup, setOpenPopup] = useState(false);

  const statusQuantity = data.statuses[status] || 0;
  const totalForPercentage = data.total > 0 ? data.total : 1;

  const percentage = ((statusQuantity / totalForPercentage) * 100).toFixed(1);

  const handleOpenPopup = () => {
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  if (isSmallScreen) {
    return (
      <Card sx={{ backgroundColor: bg, color: '#fff', p: 1 }} onClick={handleOpenPopup}>
        <Typography variant="subtitle2">{STATUS_THAI[status]}</Typography>
        <Typography variant="h6">{statusQuantity} ชิ้น</Typography>
        <Typography variant="body2">{percentage}%</Typography>
      </Card>
    );
  }

  const options = {
    chart: { type: 'donut', background: 'transparent' },
    labels: [STATUS_THAI[status], 'อื่นๆ'],
    colors: [bg, theme.palette.grey[300]],
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '85%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              color: theme.palette.text.secondary,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '18px',
              color: theme.palette.text.primary,
              formatter: () => `${percentage}%`,
            },
            total: {
              show: true,
              showAlways: true,
              label: STATUS_THAI[status],
              fontSize: '16px',
              color: theme.palette.text.secondary,
              formatter: () => `${statusQuantity} ชิ้น`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (value) => `${value} ชิ้น`,
      },
    },
    stroke: { show: false },
    responsive: [
      {
        breakpoint: 600,
        options: {
          chart: {
            width: '100%',
          },
          plotOptions: {
            pie: {
              donut: {
                size: '80%',
              },
            },
          },
        },
      },
    ],
  };

  const series = [statusQuantity, Math.max(totalForPercentage - statusQuantity, 0)];

  return (
    <>
      <Box
        sx={{
          width: '100%',
          maxWidth: 350,
          minWidth: 300,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Chart options={options} series={series} type="donut" width="280" height="280" />
      </Box>
      <Dialog
        open={openPopup}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="md"
        TransitionComponent={Transition}
      >
        <DialogTitle>{STATUS_THAI[status]} (Full View)</DialogTitle>
        <DialogContent>
          <Chart options={options} series={series} type="donut" width="100%" height="400" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePopup} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});





const ComponentRow = memo(({ component, isLoggedIn, onUpdateStatus, refreshData, isSmallScreen }) => {
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

      const currentTotal = Object.entries(component.statuses)
        .filter(([status]) => status !== 'manufactured' && status !== 'transported')
        .reduce((sum, [, value]) => sum + value, 0);
      if (
        fromStatus !== 'manufactured' &&
        fromStatus !== 'transported' &&
        toStatus !== 'manufactured' &&
        toStatus !== 'transported' &&
        currentTotal + quantityNumber > component.total
      ) {
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
        .catch(() => {
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
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1">{component.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          จำนวนทั้งหมด: {component.total}
        </Typography>
        <Box mt={2}>
          <Grid container spacing={2} justifyContent="center">
            {statusOrder.map((status) => (
              <Grid item xs={12} sm={3} key={status}>
                <Typography variant="caption" style={{ color: COLORS[status], fontWeight: 'bold' }}>
                  {STATUS_THAI[status]}: {component.statuses[status] || 0}
                </Typography>
                <DoughnutChart data={component} status={status} isSmallScreen={isSmallScreen} />
              </Grid>
            ))}
          </Grid>
          {isLoggedIn && (
            <form onSubmit={handleStatusUpdate}>
              <Grid container spacing={2} alignItems="flex-end" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>จากสถานะ</InputLabel>
                    <Select
                      value={statusUpdate.fromStatus}
                      onChange={(e) => setStatusUpdate((prev) => ({ ...prev, fromStatus: e.target.value }))}
                    >
                      {statusOrder.map((status) => (
                        <MenuItem key={status} value={status}>
                          {STATUS_THAI[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>ไปยังสถานะ</InputLabel>
                    <Select
                      value={statusUpdate.toStatus}
                      onChange={(e) => setStatusUpdate((prev) => ({ ...prev, toStatus: e.target.value }))}
                    >
                      {statusOrder.map((status) => (
                        <MenuItem key={status} value={status}>
                          {STATUS_THAI[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    label="จำนวน"
                    value={statusUpdate.quantity}
                    onChange={(e) => setStatusUpdate((prev) => ({ ...prev, quantity: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
            <Typography color="error" sx={{ mt: 1 }} variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

const ProjectRowTab2 = memo(
  ({ project, isLoggedIn, onUpdateStatus, refreshData, userRole, onProjectSelect, isSmallScreen }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleOpen = () => {
      setOpen(true);
      if (typeof onProjectSelect === 'function') {
        onProjectSelect(project);
      }
    };

    const handleClose = () => {
      setOpen(false);
    };

    const memoizedProject = useMemo(() => project, [project]);

    if (!memoizedProject.components || memoizedProject.components.length === 0) {
      return null;
    }

    return (
      <>
        <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={handleOpen}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{memoizedProject.name}</Typography>
              <IconButton size="small">
                <KeyboardArrowRightIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">
              รหัสโครงการ: {memoizedProject.project_code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              จำนวนชิ้นงานอื่นๆ: {memoizedProject.components.length}
            </Typography>
          </CardContent>
        </Card>

        <Dialog
          fullScreen={isSmallScreen}
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
          maxWidth={isSmallScreen ? false : 'lg'}
          fullWidth={!isSmallScreen}
        >
          {isSmallScreen ? (
            <AppBar sx={{ position: 'relative' }}>
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                  <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                  {memoizedProject.name}
                </Typography>
              </Toolbar>
            </AppBar>
          ) : (
            <DialogTitle>{memoizedProject.name}</DialogTitle>
          )}
          <DialogContent
            sx={{
              padding: theme.spacing(3),
              [theme.breakpoints.up('md')]: {
                minHeight: '70vh',
                maxHeight: '80vh',
                overflowY: 'auto',
              },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              รหัสโครงการ: {memoizedProject.project_code}
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              ชิ้นงานอื่นๆ
            </Typography>
            <Grid container spacing={2}>
              {memoizedProject.components.map((component) => (
                <Grid item xs={12} md={6} key={component.id}>
                  <ComponentRow
                    component={component}
                    isLoggedIn={isLoggedIn}
                    onUpdateStatus={onUpdateStatus}
                    refreshData={refreshData}
                    isSmallScreen={isSmallScreen}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          {!isSmallScreen && (
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                ปิด
              </Button>
            </DialogActions>
          )}
        </Dialog>
      </>
    );
  }
);

const Tab2Content = memo(({ onProjectSelect, userRole }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
        await updateOtherComponentStatus(componentId, fromStatus, toStatus, parseInt(quantity, 10));

        setProjects((prevProjects) =>
          prevProjects.map((project) => ({
            ...project,
            components: project.components.map((component) => {
              if (component.id === componentId) {
                const updatedStatuses = { ...component.statuses };

                if (fromStatus !== 'manufactured') {
                  updatedStatuses[fromStatus] = Math.max(0, (updatedStatuses[fromStatus] || 0) - quantity);
                }

                updatedStatuses[toStatus] = (updatedStatuses[toStatus] || 0) + quantity;

                if (fromStatus === 'manufactured' && toStatus === 'transported') {
                  updatedStatuses['manufactured'] = updatedStatuses['manufactured'] || 0;
                }

                return { ...component, statuses: updatedStatuses };
              }
              return component;
            }),
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
    [isLoggedIn]
  );

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectRowTab2
                project={project}
                isLoggedIn={isLoggedIn}
                onUpdateStatus={handleUpdateStatus}
                refreshData={loadProjects}
                userRole={userRole}
                onProjectSelect={onProjectSelect}
                isSmallScreen={isSmallScreen}
              />
            </Grid>
          ))}
          {projects.length === 0 && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                <Typography>ไม่พบโครงการที่มีชิ้นงานอื่นๆ</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
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

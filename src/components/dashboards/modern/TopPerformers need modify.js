import React, { useState, useEffect, memo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  InputBase,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import { 
  fetchProjects, 
  fetchComponentsByProjectId,
  fetchComponentById,
  fetchUserById
} from 'src/utils/api';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.8rem',
  },
}));

const statusDisplayMap = {
  Manufactured: 'ผลิตแล้ว',
  'In Transit': 'อยู่ระหว่างขนส่ง',
  Transported: 'ขนส่งสำเร็จ',
  Accepted: 'ตรวจรับแล้ว',
  Installed: 'ติดตั้งแล้ว',
  Rejected: 'ถูกปฏิเสธ',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Manufactured':
      return '#53b3cb';
    case 'In Transit':
      return '#e9eb9e';
    case 'Transported':
      return '#a1869e';
    case 'Accepted':
      return '#32d2a2';
    case 'Installed':
      return '#adfc92';
    case 'Rejected':
      return '#ed8209';
    default:
      return '#fefefe';
  }
};

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: getStatusColor(status),
  color: status === 'Rejected' ? theme.palette.common.white : theme.palette.common.black,
  fontWeight: 'bold',
  margin: '2px',
  transition: 'all 0.3s ease',
  fontSize: '0.9rem',
  height: '32px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
    height: '24px',
  },
}));

const ComponentDialog = memo(({ open, onClose, component, projectCode }) => {
  const [tabValue, setTabValue] = useState(0);
  const [componentDetails, setComponentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchComponentById(component.id);
        
        const historyWithUsernames = await Promise.all(
          details.history.map(async (item) => {
            const user = await fetchUserById(item.updated_by);
            return { ...item, username: user.username };
          })
        );
        
        setComponentDetails({ ...details, history: historyWithUsernames });
      } catch (err) {
        console.error('Error fetching component details:', err);
        setError('Failed to load component details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && component.id) {
      fetchDetails();
    }
  }, [open, component.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileDownload = async () => {
    if (componentDetails && componentDetails.file_path) {
      try {
        const response = await fetch(componentDetails.file_path);
        if (!response.ok) {
          throw new Error('File not accessible');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = componentDetails.name + '.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setFileError(true);
        setSnackbarMessage('Unable to download file. Please try again later.');
        setSnackbarOpen(true);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography color="error">{error}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียด: {componentDetails?.name}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="รายละเอียดชิ้นงาน" />
            <Tab label="ประวัติสถานะ" />
          </Tabs>
          {tabValue === 0 && componentDetails && (
            <>
              <Table size="small">
                <TableBody>
                  {Object.entries(componentDetails).map(([key, value]) => {
                    if (key !== 'history' && typeof value !== 'object') {
                      return (
                        <TableRow key={key}>
                          <TableCell component="th" scope="row">
                            {key}
                          </TableCell>
                          <TableCell align="right">{value.toString()}</TableCell>
                        </TableRow>
                      );
                    }
                    return null;
                  })}
                </TableBody>
              </Table>
              {componentDetails.file_path && (
                <Box mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<GetAppIcon />}
                    onClick={handleFileDownload}
                    disabled={fileError}
                  >
                    {fileError ? 'File Unavailable' : 'ดาวน์โหลดไฟล์'}
                  </Button>
                </Box>
              )}
            </>
          )}
          {tabValue === 1 && componentDetails && componentDetails.history && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>วันที่อัปเดต</TableCell>
                  <TableCell>อัปเดตโดย</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {componentDetails.history.map((historyItem, index) => (
                  <TableRow key={index}>
                    <TableCell>{historyItem.status}</TableCell>
                    <TableCell>{new Date(historyItem.updated_at).toLocaleString()}</TableCell>
                    <TableCell>{historyItem.username}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
});

const SectionRow = memo(({ section, projectCode, isSmallScreen }) => {
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const statusCounts = section.components.reduce((acc, component) => {
    if (!acc[component.status]) {
      acc[component.status] = 0;
    }
    acc[component.status]++;
    return acc;
  }, {});

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={isSmallScreen ? 1 : 2}>ชั้น {section.id}</TableCell>
        {!isSmallScreen && <TableCell align="right">{section.components.length} ชิ้นงาน</TableCell>}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isSmallScreen ? 2 : 5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชิ้นงาน
              </Typography>
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" mb={2}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <StatusChip key={status} label={`${statusDisplayMap[status] || status}: ${count}`} status={status} />
                ))}
              </Box>
              <Grid container spacing={1}>
                {section.components.map((component) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={component.id}>
                    <Card
                      style={{
                        backgroundColor: getStatusColor(component.status),
                        color: component.status === 'Rejected' ? 'white' : 'black',
                        height: '85px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '6px',
                        margin: '4px',
                      }}
                    >
                      <CardContent style={{ textAlign: 'center', padding: '3px' }}>
                        <Typography
                          variant="subtitle2"
                          style={{ color: 'inherit', fontSize: '11px', fontWeight: 'bold' }}
                        >
                          {component.name}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedComponent(component)}
                          style={{
                            marginTop: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'inherit',
                            fontSize: '10px',
                            padding: '2px 6px',
                          }}
                        >
                          ดูข้อมูล
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      {selectedComponent && (
        <ComponentDialog
          open={Boolean(selectedComponent)}
          onClose={() => setSelectedComponent(null)}
          component={selectedComponent}
          projectCode={projectCode}
        />
      )}
    </>
  );
});

const ProjectRow = memo(({ project, onRowClick, isSmallScreen }) => {
  const [open, setOpen] = useState(false);

  const totalComponents = project.sections.reduce(
    (acc, section) => acc + section.components.length,
    0,
  );

  const handleRowClick = () => {
    onRowClick(project);
  };

  const handleIconClick = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };

  return (
    <>
      <TableRow onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton size="small" onClick={handleIconClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{project.code}</TableCell>
        {!isSmallScreen && <TableCell>{project.name}</TableCell>}
        {!isSmallScreen && <TableCell align="right">{project.sections.length}</TableCell>}
        <TableCell align="right">{totalComponents}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isSmallScreen ? 3 : 5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชั้น
              </Typography>
              <Table size="small">
                <TableBody>
                  {project.sections.map((section) => (
                    <SectionRow key={section.id} section={section} projectCode={project.code} isSmallScreen={isSmallScreen} />
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

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TopPerformers = ({ onRowClick }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await fetchProjects();
        const projectsWithComponents = await Promise.all(
          response.data.map(async (project) => {
            try {
              const components = await fetchComponentsByProjectId(project.id);
              return {
                ...project,
                sections: [{ id: 1, components }],
              };
            } catch (componentError) {
              console.error(`Error fetching components for project ${project.id}:`, componentError);
              return {
                ...project,
                sections: [{ id: 1, components: [] }],
              };
            }
          }),
        );
        setProjects(projectsWithComponents);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setSnackbarMessage('Failed to load projects. Please try again later.');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 0 } }}>
          ข้อมูลโครงการ
        </Typography>
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Search>
      </Box>
      <TableContainer>
        <Table aria-label="collapsible table" size={isSmallScreen ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <StyledTableCell />
              <StyledTableCell>รหัสโครงการ</StyledTableCell>
              {!isSmallScreen && <StyledTableCell>ชื่อโครงการ</StyledTableCell>}
              {!isSmallScreen && <StyledTableCell align="right">จำนวนชั้น</StyledTableCell>}
              <StyledTableCell align="right">จำนวนชิ้นงาน</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <ProjectRow key={project.id} project={project} onRowClick={onRowClick} isSmallScreen={isSmallScreen} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredProjects.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <Typography>No projects found matching your search.</Typography>
        </Box>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TopPerformers;
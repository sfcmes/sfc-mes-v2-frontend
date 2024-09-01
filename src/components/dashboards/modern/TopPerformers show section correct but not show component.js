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
  Button,
  Grid,
  Card,
  CardContent,
  InputBase,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import {
  fetchProjects,
  fetchComponentsByProjectId,
  fetchComponentById,
  fetchUserById,
  downloadFile,
  openFile,
  updateComponent,
  addComponentHistory,
  fetchUserProfile,
} from 'src/utils/api';
import ComponentDialog from './ComponentDialog'; // Make sure this path is correct

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
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

const statusOrder = [
  'Manufactured',
  'In Transit',
  'Transported',
  'Accepted',
  'Installed',
  'Rejected',
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Manufactured':
      return { bg: 'primary.light', color: 'primary.main' };
    case 'In Transit':
      return { bg: 'warning.light', color: 'warning.main' };
    case 'Transported':
      return { bg: 'secondary.light', color: 'secondary.main' };
    case 'Accepted':
      return { bg: 'info.light', color: 'info.main' };
    case 'Installed':
      return { bg: 'success.light', color: 'success.main' };
    case 'Rejected':
      return { bg: 'error.light', color: 'error.main' };
    default:
      return { bg: 'grey.light', color: 'grey.main' };
  }
};

const StatusChip = memo(({ status, label }) => {
  const { bg, color } = getStatusColor(status);
  return (
    <Box
      component="span"
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '16px',
        fontSize: { xs: '0.7rem', sm: '0.9rem' },
        display: 'inline-block',
        margin: '2px',
      }}
    >
      {label}
    </Box>
  );
});

const SectionRow = memo(({ section, projectCode, isSmallScreen, onComponentUpdate }) => {
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const sortedComponents = section.components.sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );

  const statusCounts = section.components.reduce((acc, component) => {
    acc[component.status] = (acc[component.status] || 0) + 1;
    return acc;
  }, {});

  const handleComponentUpdate = (updatedComponent) => {
    const updatedComponents = section.components.map(comp => 
      comp.id === updatedComponent.id ? updatedComponent : comp
    );
    onComponentUpdate(section.id, updatedComponents);
  };

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
              <Box display="flex" flexWrap="wrap" justifyContent="flex-start" mb={2}>
                {statusOrder.map((status) => {
                  const count = statusCounts[status] || 0;
                  if (count > 0) {
                    return (
                      <StatusChip
                        key={status}
                        status={status}
                        label={`${statusDisplayMap[status]}: ${count}`}
                      />
                    );
                  }
                  return null;
                })}
              </Box>
              <Grid container spacing={1}>
                {sortedComponents.map((component) => {
                  const { bg, color } = getStatusColor(component.status);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={component.id}>
                      <Card
                        sx={{
                          bgcolor: bg,
                          height: '85px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          p: '6px',
                          m: '4px',
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: '3px' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: color, fontSize: '11px', fontWeight: 'bold' }}
                          >
                            {component.name}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => setSelectedComponent(component)}
                            sx={{
                              mt: '6px',
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: color,
                              fontSize: '10px',
                              p: '2px 6px',
                            }}
                          >
                            ดูข้อมูล
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
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
          onComponentUpdate={handleComponentUpdate}
        />
      )}
    </>
  );
});

const ProjectRow = memo(({ project, onRowClick, isSmallScreen, onProjectUpdate }) => {
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

  const handleSectionUpdate = (sectionId, updatedComponents) => {
    const updatedSections = project.sections.map(section =>
      section.id === sectionId ? { ...section, components: updatedComponents } : section
    );
    onProjectUpdate(project.id, { ...project, sections: updatedSections });
  };

  return (
    <>
      <TableRow onClick={handleRowClick} style={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton size="small" onClick={handleIconClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{project.project_code}</TableCell>
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
                    <SectionRow
                      key={section.id}
                      section={section}
                      projectCode={project.project_code}
                      isSmallScreen={isSmallScreen}
                      onComponentUpdate={(sectionId, updatedComponents) => handleSectionUpdate(sectionId, updatedComponents)}
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

  const handleProjectUpdate = (projectId, updatedProject) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? updatedProject : project
      )
    );
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
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: alpha(theme.palette.background.paper, 0.9), // Semi-transparent background based on theme
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
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
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
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
                <ProjectRow
                  key={project.id}
                  project={project}
                  onRowClick={onRowClick}
                  isSmallScreen={isSmallScreen}
                  onProjectUpdate={handleProjectUpdate}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {filteredProjects.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <Typography>ไม่พบโครงการที่คุณค้นหา.</Typography>
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

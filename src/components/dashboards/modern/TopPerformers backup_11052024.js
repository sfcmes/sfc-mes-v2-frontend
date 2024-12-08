import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  Tabs,
  Tab,
  InputBase,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  fetchProjects,
  fetchComponentsByProjectId,
} from 'src/utils/api';
import ComponentDialog from './ComponentDialog';
import Tab2Content from './Tab2Content';

/** Constants **/
const COLORS = {
  planning: '#64b5f6',
  manufactured: '#82ca9d',
  transported: '#ffc658',
  accepted: '#8e44ad',
  installed: '#27ae60',
  rejected: '#ff6b6b',
};

const STATUS_THAI = {
  planning: 'รอผลิต',
  manufactured: 'ผลิตแล้ว',
  transported: 'ขนส่งสำเร็จ',
  accepted: 'ตรวจรับแล้ว',
  installed: 'ติดตั้งแล้ว',
  rejected: 'ถูกปฏิเสธ',
};

const statusOrder = [
  'planning',
  'manufactured',
  'transported',
  'accepted',
  'installed',
  'rejected',
];

const getStatusColor = (status) => {
  return { bg: COLORS[status], color: '#ffffff' };
};

/** Styled Components **/
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.8rem',
  },
}));

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
    // Padding left includes the search icon's width
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

/** StatusChip Component **/
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

/** ComponentCard Component **/
const ComponentCard = memo(({ component, onOpenDialog }) => {
  const { bg, color } = getStatusColor(component.status);

  return (
    <Grid item xs={3} sm={1.1} md={0.9}>
      <Tooltip title={component.name} arrow>
        <Card
          sx={{
            bgcolor: bg,
            height: { xs: '40px', sm: '45px', md: '50px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: '1px',
            m: '1px',
            border: '1px solid',
            borderColor: bg,
            cursor: 'pointer',
          }}
          onClick={() => onOpenDialog(component)}
        >
          <CardContent
            sx={{
              textAlign: 'center',
              p: '1px',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: color,
                fontSize: { xs: '5px', sm: '6px', md: '7px' },
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {component.name}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDialog(component);
              }}
              sx={{
                mt: '1px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: color,
                fontSize: { xs: '4px', sm: '5px', md: '6px' },
                p: '1px 2px',
                minWidth: 'auto',
              }}
            >
              ดูข้อมูล
            </Button>
          </CardContent>
        </Card>
      </Tooltip>
    </Grid>
  );
});

/** SectionAccordion Component **/
const SectionAccordion = memo(({ section, projectCode, onOpenDialog }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const statusCounts = useMemo(
    () =>
      section.components.reduce((acc, component) => {
        acc[component.status] = (acc[component.status] || 0) + 1;
        return acc;
      }, {}),
    [section.components]
  );

  return (
    <Accordion
      expanded={expanded === `panel${section.id}`}
      onChange={handleChange(`panel${section.id}`)}
      sx={{
        mb: 2,
        boxShadow: 3,
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(180deg)',
          },
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
          },
        }}
      >
        <Typography variant="subtitle1">
          {section.name || `ชั้นที่ ${section.id}`}
        </Typography>
        <Box display="flex" flexWrap="wrap" mt={1}>
          {statusOrder.map((status) => {
            const count = statusCounts[status] || 0;
            return (
              <StatusChip
                key={status}
                status={status}
                label={`${STATUS_THAI[status]}: ${count}`}
              />
            );
          })}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={1}>
          {section.components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onOpenDialog={onOpenDialog}
            />
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

/** ProjectModal Component **/
const ProjectModal = memo(
  ({ project, open, onClose, userRole, canEdit, onProjectSelect }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedComponent, setSelectedComponent] = useState(null);

    useEffect(() => {
      if (open && project) {
        onProjectSelect(project);
      }
    }, [open, project, onProjectSelect]);

    const handleComponentUpdate = useCallback((updatedComponent) => {
      // Update the component in the project state
      // This depends on how you're managing state (e.g., Redux, Context API)
    }, []);

    const sortedSections = useMemo(() => {
      if (!project || !project.sections) return [];
      return [...project.sections]
        .sort((a, b) => compareNames(a.name || '', b.name || ''))
        .map((section) => ({
          ...section,
          components: sortComponents(section.components),
        }));
    }, [project]);

    const handleOpenDialog = useCallback((component) => {
      setSelectedComponent(component);
    }, []);

    const handleCloseDialog = useCallback(() => {
      setSelectedComponent(null);
    }, []);

    return (
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        aria-labelledby="project-dialog-title"
        PaperProps={{
          style: {
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <DialogTitle
          id="project-dialog-title"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {project.name || `โปรเจค ${project.project_code}`}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme.palette.primary.contrastText,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            รายละเอียดชั้น
          </Typography>
          {sortedSections.map((section) => (
            <SectionAccordion
              key={section.id}
              section={section}
              projectCode={project.project_code}
              onOpenDialog={handleOpenDialog}
            />
          ))}
        </DialogContent>
        {selectedComponent && (
          <ComponentDialog
            open={Boolean(selectedComponent)}
            onClose={handleCloseDialog}
            component={selectedComponent}
            projectCode={project.project_code}
            onComponentUpdate={handleComponentUpdate}
            canEdit={canEdit}
          />
        )}
      </Dialog>
    );
  }
);

/** Helper Functions **/
const parseName = (name) => {
  const matchFRP = name.match(/^(\D+)-(\d+)-(\d+)$/);
  if (matchFRP) {
    const [, prefix, group, number] = matchFRP;
    return {
      prefix,
      group: parseInt(group, 10),
      number: parseInt(number, 10),
    };
  }
  const matchSection = name.match(/^(\d+)-(\d+)$/);
  if (matchSection) {
    const [, group, number] = matchSection;
    return { group: parseInt(group, 10), number: parseInt(number, 10) };
  }
  if (/^\d+$/.test(name)) {
    return { number: parseInt(name, 10) };
  }
  return { original: name };
};

const compareNames = (a, b) => {
  const aInfo = parseName(a);
  const bInfo = parseName(b);

  if (aInfo.prefix && bInfo.prefix) {
    if (aInfo.prefix !== bInfo.prefix)
      return aInfo.prefix.localeCompare(bInfo.prefix);
    if (aInfo.group !== bInfo.group) return aInfo.group - bInfo.group;
    return aInfo.number - bInfo.number;
  }
  if ('group' in aInfo && 'group' in bInfo) {
    if (aInfo.group !== bInfo.group) return aInfo.group - bInfo.group;
    return aInfo.number - bInfo.number;
  }
  if (
    'number' in aInfo &&
    'number' in bInfo &&
    !('group' in aInfo) &&
    !('group' in bInfo)
  ) {
    return aInfo.number - bInfo.number;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

const sortComponents = (components) => {
  return components.sort((a, b) => {
    const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    if (statusDiff !== 0) return statusDiff;
    return compareNames(a.name, b.name);
  });
};

/** ProjectRow Component **/
const ProjectRow = memo(
  ({
    project,
    userRole,
    selectedProjectId,
    canEdit,
    onProjectSelect,
  }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const isSelected = project.id === selectedProjectId;

    const numberOfSections = project.sections.length;
    const totalComponents = project.sections.reduce(
      (acc, section) => acc + section.components.length,
      0
    );

    const handleRowClick = useCallback(() => {
      setModalOpen(true);
      onProjectSelect(project);
    }, [onProjectSelect, project]);

    return (
      <>
        <TableRow
          onClick={handleRowClick}
          style={{ cursor: 'pointer' }}
          sx={{
            backgroundColor: isSelected ? alpha('#64b5f6', 0.5) : 'inherit',
            color: isSelected ? '#ffffff' : 'inherit',
            '&:hover': {
              backgroundColor: alpha('#64b5f6', 0.5),
              color: '#ffffff',
            },
          }}
        >
          <TableCell>
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              <KeyboardArrowDownIcon />
            </IconButton>
          </TableCell>
          <TableCell>{project.project_code}</TableCell>
          {!isSmallScreen && <TableCell>{project.name}</TableCell>}
          {!isSmallScreen && (
            <TableCell align="right">{numberOfSections}</TableCell>
          )}
          <TableCell align="right">{totalComponents}</TableCell>
        </TableRow>

        <ProjectModal
          project={project}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          userRole={userRole}
          canEdit={canEdit}
          onProjectSelect={onProjectSelect}
        />
      </>
    );
  }
);

/** TopPerformers Component **/
const TopPerformers = memo(
  ({
    onProjectSelect,
    userRole,
    refreshTrigger,
    onTabChange,
    userProjects,
  }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState('1');
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const canEditProject = useCallback(
      (projectId) => {
        if (userRole === 'Admin') return true;
        if (userRole === 'Site User') {
          return userProjects.includes(projectId);
        }
        return false;
      },
      [userRole, userProjects]
    );

    const handleSearchChange = useCallback((event) => {
      setSearchTerm(event.target.value);
    }, []);

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
      onTabChange(newValue);
    };

    const handleProjectSelect = useCallback(
      (project) => {
        setSelectedProjectId(project.id);
        if (onProjectSelect) {
          onProjectSelect(project);
        }
      },
      [onProjectSelect]
    );

    useEffect(() => {
      const loadProjects = async () => {
        try {
          setLoading(true);
          const response = await fetchProjects();

          const projectsWithComponents = await Promise.all(
            response.data.map(async (project) => {
              try {
                const components = await fetchComponentsByProjectId(project.id);

                if (!Array.isArray(components)) {
                  console.error(
                    `Components data is not an array for project ${project.project_code}`,
                    components
                  );
                  return null;
                }

                const sections = components.reduce((acc, component) => {
                  let section = acc.find(
                    (sec) => sec.id === component.section_id
                  );
                  if (!section) {
                    section = {
                      id: component.section_id,
                      name:
                        component.section_name ||
                        `Section ${component.section_id}`,
                      components: [],
                    };
                    acc.push(section);
                  }
                  section.components.push(component);
                  return acc;
                }, []);

                return { ...project, sections };
              } catch (error) {
                console.error(
                  `Error processing project ${project.project_code}:`,
                  error.message
                );
                return null;
              }
            })
          );

          setProjects(projectsWithComponents.filter((project) => project !== null));
        } catch (err) {
          console.error('Error fetching projects:', err.message);
          setError('Failed to load projects. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      loadProjects();
    }, [refreshTrigger]);

    const filteredProjects = useMemo(
      () =>
        projects.filter((project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [projects, searchTerm]
    );

    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="300px"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return (
      <Paper
        elevation={3}
        sx={{
          p: isSmallScreen ? 1 : { xs: 1, sm: 2, md: 3 },
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 0 } }}
          >
            ข้อมูลโครงการ
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="ค้นหา…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Tabs">
          <Tab label="ชิ้นงานพรีคาสท์" value="1" />
          <Tab label="ชิ้นงานอื่นๆ" value="2" />
        </Tabs>
        {tabValue === '1' && (
          <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            <TableContainer sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <Table
                stickyHeader
                aria-label="collapsible table"
                size={isSmallScreen ? 'small' : 'medium'}
              >
                <TableHead>
                  <TableRow>
                    <StyledTableCell />
                    <StyledTableCell>รหัสโครงการ</StyledTableCell>
                    {!isSmallScreen && (
                      <StyledTableCell>ชื่อโครงการ</StyledTableCell>
                    )}
                    {!isSmallScreen && (
                      <StyledTableCell align="right">
                        จำนวนชั้น
                      </StyledTableCell>
                    )}
                    <StyledTableCell align="right">
                      จำนวนชิ้นงาน
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      userRole={userRole}
                      selectedProjectId={selectedProjectId}
                      canEdit={canEditProject(project.id)}
                      onProjectSelect={handleProjectSelect}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tabValue === '2' && (
          <Tab2Content
            isSmallScreen={isSmallScreen}
            onProjectSelect={onProjectSelect}
            userRole={userRole}
          />
        )}
        {filteredProjects.length === 0 && tabValue === '1' && (
          <TableBody>
            <TableRow>
              <TableCell colSpan={5}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100px"
                >
                  <Alert severity="info">ไม่พบข้อมูล</Alert>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Paper>
    );
  }
);

export default TopPerformers;

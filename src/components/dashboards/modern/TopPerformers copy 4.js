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
  Select,
  MenuItem,
  Tab,
  Tabs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GetAppIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import { fetchProjects, fetchSectionsByProjectId } from '../../../services/projectService'; // Ensure this import path is correct

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'ผลิตแล้ว':
      return '#FFC107';
    case 'อยู่ระหว่างขนส่ง':
      return '#2196F3';
    case 'ขนส่งสำเร็จ':
      return '#C2AFF0';
    case 'ติดตั้งแล้ว':
      return '#18F2B2';
    case 'Rejected':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const handleFileDownload = (file) => {
  console.log(`Downloading file: ${file.fileName}`);
  window.open(file.url, '_blank');
};

const FileHistoryTable = memo(({ files = [] }) => (
  <TableContainer component={Paper} style={{ marginTop: '20px' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ชื่อไฟล์</TableCell>
          <TableCell>เวอร์ชั่น</TableCell>
          <TableCell>อัพโหลดโดย</TableCell>
          <TableCell>วันที่อัพโหลด</TableCell>
          <TableCell>ดาวน์โหลด</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell>{file.fileName}</TableCell>
            <TableCell>{file.revision}</TableCell>
            <TableCell>{file.uploadedBy}</TableCell>
            <TableCell>{file.uploadDate}</TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => handleFileDownload(file)}>
                <GetAppIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

const displayLabels = {
  id: 'รหัสชิ้นงาน',
  name: 'ชื่อชิ้นงาน',
  width: 'ความกว้าง',
  height: 'ความสูง',
  thickness: 'ความหนา',
  weight: 'น้ำหนัก',
  coating: 'คอนกรีต',
  addition: 'ตร.ม เพิ่ม/ลด',
  squareMeters: 'ตารางเมตร',
  status: 'สถานะ',
};

const ComponentDialog = memo(({ open, onClose, component = {}, projectCode }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>รายละเอียด: {component.name}</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="รายละเอียดชิ้นงาน" />
          <Tab label="ไฟล์และประวัติ" />
        </Tabs>
        {tabValue === 0 && (
          <Table size="small">
            <TableBody>
              {Object.entries(component).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">{displayLabels[key]}</TableCell>
                  <TableCell align="right">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {tabValue === 1 && (
          <FileHistoryTable files={component.fileHistory} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
});

const StatusChip = ({ status, count }) => {
  const StyledChip = styled(Chip)(({ theme }) => ({
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
    [theme.breakpoints.between('sm', 'md')]: {
      fontSize: '0.8rem',
      height: '28px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '0.9rem',
      height: '32px',
    },
  }));

  return <StyledChip label={`${status}: ${count}`} />;
};

const SectionRow = memo(({ section = {}, projectCode }) => {
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const statusCounts = section.components ? section.components.reduce((acc, component) => {
    if (!acc[component.status]) {
      acc[component.status] = 0;
    }
    acc[component.status]++;
    return acc;
  }, {}) : {};

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={2}>ชั้น {section.id}</TableCell>
        <TableCell align="right">{section.components ? section.components.length : 0} ชิ้นงาน</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชิ้นงาน
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                {['ผลิตแล้ว', 'อยู่ระหว่างขนส่ง', 'ขนส่งสำเร็จ', 'ติดตั้งแล้ว', 'Rejected'].map((status) => (
                  <StatusChip key={status} status={status} count={statusCounts[status] || 0} />
                ))}
              </Box>
              <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Grid container spacing={1}>
                  {section.components ? section.components.map((component) => (
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
                  )) : <Typography>ไม่พบข้อมูล</Typography>}
                </Grid>
              </Box>
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

const ProjectRow = memo(({ project, onRowClick }) => {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState([]);

  const totalComponents = sections.reduce((acc, section) => acc + (section.components ? section.components.length : 0), 0);

  const handleRowClick = async () => {
    const fetchedSections = await fetchSectionsByProjectId(project.id);
    setSections(fetchedSections);
    onRowClick({ ...project, sections: fetchedSections });
  };

  const handleIconClick = async (event) => {
    event.stopPropagation(); // Prevent the row click event from firing
    if (!open) {
      const fetchedSections = await fetchSectionsByProjectId(project.id);
      setSections(fetchedSections);
    }
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
        <TableCell>{project.name}</TableCell>
        <TableCell align="right">{sections.length}</TableCell>
        <TableCell align="right">{totalComponents}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชั้น
              </Typography>
              <Table size="small">
                <TableBody>
                  {sections.map((section) => (
                    <SectionRow key={section.id} section={section} projectCode={project.code} />
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TopPerformers = ({ onRowClick }) => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    getProjects();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" style={{ fontWeight: 'bold' }}>โครงการ</Typography>
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
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <StyledTableCell />
              <StyledTableCell>รหัสโครงการ</StyledTableCell>
              <StyledTableCell>ชื่อโครงการ</StyledTableCell>
              <StyledTableCell align="right">จำนวนชั้น</StyledTableCell>
              <StyledTableCell align="right">จำนวนชิ้นงานทั้งหมด</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects
              .filter((project) =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((project) => (
                <ProjectRow key={project.id} project={project} onRowClick={onRowClick} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TopPerformers;

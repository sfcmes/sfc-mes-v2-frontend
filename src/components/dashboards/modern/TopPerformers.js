import React, { useState } from 'react';
import DashboardCard from '../../shared/DashboardCard';
import CustomSelect from '../../forms/theme-elements/CustomSelect';
import {
  MenuItem, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, TableContainer, Modal
} from '@mui/material';
import SectionsTable from './SectionsTable';
import ComponentsTable from './ComponentsTable';

const projects = [
  {
    id: '58cd3eb8-e397-4676-9a51-db30f4f97e57',
    code: 'UA',
    name: 'ลูกขั้นบันได UOB (TOWER A)',
    status: 'In Progress',
    progress: 65,
    sections: 10,
    components: 100
  },
  {
    id: '6f670de8-54f0-4af1-acb7-76f41c618e86',
    code: 'SKF',
    name: 'Skyrise (Tower F)',
    status: 'Completed',
    progress: 100,
    sections: 10,
    components: 100
  },
  {
    id: '89cdfe36-5b1b-4679-b737-3a8bcfd29618',
    code: 'SKG',
    name: 'Skyrise (Tower G)',
    status: 'In Progress',
    progress: 80,
    sections: 10,
    components: 100
  },
  {
    id: 'b856b64b-b25a-42ab-be7c-d37715f6df2c',
    code: 'SKE',
    name: 'Skyrise (Tower E)',
    status: 'Delayed',
    progress: 40,
    sections: 10,
    components: 100
  },
  {
    id: 'bc2d14b2-8ac1-4025-b338-d0c838ebe08d',
    code: 'SKD',
    name: 'Skyrise (Tower D)',
    status: 'In Progress',
    progress: 90,
    sections: 10,
    components: 100
  },
  {
    id: 'f7025e3b-6ab0-4b99-b8cb-3593fc2f9ce2',
    code: 'UB',
    name: 'ลูกขั้นบันได UOB (TOWER B)',
    status: 'In Progress',
    progress: 75,
    sections: 10,
    components: 100
  },
];

const mockSections = {
  UA: Array.from({ length: 10 }, (_, i) => ({
    section_id: `UA-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
  SKF: Array.from({ length: 10 }, (_, i) => ({
    section_id: `SKF-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
  SKG: Array.from({ length: 10 }, (_, i) => ({
    section_id: `SKG-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
  SKE: Array.from({ length: 10 }, (_, i) => ({
    section_id: `SKE-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
  SKD: Array.from({ length: 10 }, (_, i) => ({
    section_id: `SKD-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
  UB: Array.from({ length: 10 }, (_, i) => ({
    section_id: `UB-${i + 1}`,
    section_name: `Floor ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    components: 10,
  })),
};


const mockComponents = {
  'UA-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `UA-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  'SKF-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `SKF-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  'SKG-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `SKG-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  'SKE-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `SKE-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  'SKD-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `SKD-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  'UB-1': Array.from({ length: 10 }, (_, i) => ({
    component_id: `UB-1-${i + 1}`,
    component_name: `Component ${i + 1}`,
    status: i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'In Progress' : 'Planning',
    type: i % 3 === 0 ? 'Wall' : i % 3 === 1 ? 'Floor' : 'Ceiling',
  })),
  // Add similar mock data for other sections
};

const TopPerformers = () => {
  const [month, setMonth] = useState('1');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleChange = (event) => {
    setMonth(event.target.value);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setProjectModalOpen(true);
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setSectionModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setProjectModalOpen(false);
    setSelectedProject(null);
  };

  const handleCloseSectionModal = () => {
    setSectionModalOpen(false);
    setSelectedSection(null);
  };

  return (
    <>
      <DashboardCard
        title="Top Projects"
        subtitle="Project Status"
        action={
          <CustomSelect
            labelId="month-dd"
            id="month-dd"
            size="small"
            value={month}
            onChange={handleChange}
          >
            <MenuItem value={1}>March 2022</MenuItem>
            <MenuItem value={2}>April 2022</MenuItem>
            <MenuItem value={3}>May 2022</MenuItem>
          </CustomSelect>
        }
      >
        <TableContainer>
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: 'nowrap',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Project</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Progress</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Sections</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Components</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} onDoubleClick={() => handleProjectClick(project)}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {project.name}
                      </Typography>
                      <Typography color="textSecondary" fontSize="12px" variant="subtitle2">
                        {project.code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      sx={{
                        bgcolor:
                          project.status === 'In Progress'
                            ? (theme) => theme.palette.warning.light
                            : project.status === 'Completed'
                            ? (theme) => theme.palette.success.light
                            : project.status === 'Delayed'
                            ? (theme) => theme.palette.error.light
                            : (theme) => theme.palette.secondary.light,
                        color:
                          project.status === 'In Progress'
                            ? (theme) => theme.palette.warning.main
                            : project.status === 'Completed'
                            ? (theme) => theme.palette.success.main
                            : project.status === 'Delayed'
                            ? (theme) => theme.palette.error.main
                            : (theme) => theme.palette.secondary.main,
                        borderRadius: '8px',
                      }}
                      size="small"
                      label={project.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {project.progress}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {project.sections}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {project.components}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DashboardCard>

      <Modal
        open={projectModalOpen}
        onClose={handleCloseProjectModal}
        aria-labelledby="project-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto',
        }}>
          <Typography id="project-modal-title" variant="h6" component="h2" gutterBottom>
            Sections for {selectedProject?.name}
          </Typography>
          <SectionsTable 
            sections={selectedProject ? mockSections[selectedProject.code] : []} 
            onSectionClick={handleSectionClick}
          />
        </Box>
      </Modal>

      <Modal
        open={sectionModalOpen}
        onClose={handleCloseSectionModal}
        aria-labelledby="section-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '80vh',
          overflow: 'auto',
        }}>
          <Typography id="section-modal-title" variant="h6" component="h2" gutterBottom>
            Components for {selectedSection?.section_name}
          </Typography>
          <ComponentsTable 
            components={selectedSection ? mockComponents[selectedSection.section_id] : []}
          />
        </Box>
      </Modal>
    </>
  );
};

export default TopPerformers;

import React, { useState } from 'react';
import { CardContent, Grid, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVProject from '../../components/forms/form-validation/FVProject';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'สร้างโครงการใหม่' },
];

const initialProjects = [
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

const ProjectTable = ({ projects }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
    <Table stickyHeader aria-label="project table">
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Project Name
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Status
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Progress
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Sections
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Components
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.map((project) => (
          <TableRow hover key={project.id}>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="600">
                {project.name}
              </Typography>
              <Typography color="textSecondary" variant="body2">
                {project.code}
              </Typography>
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
              <Typography color="textSecondary" variant="subtitle2">
                {project.progress}%
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="subtitle2">
                {project.sections}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography color="textSecondary" variant="subtitle2">
                {project.components}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const FormProject = () => {
  const [projects, setProjects] = useState(initialProjects);

  const handleAddProject = (newProject) => {
    setProjects([...projects, newProject]);
  };

  return (
    <PageContainer title="สร้างโครงการใหม่" description="This is the form to create a new project.">
      <Breadcrumb title="สร้างโครงการใหม่" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="Projects Overview">
            <ProjectTable projects={projects} />
          </ParentCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ParentCard title="สร้างโครงการใหม่">
            <CardContent>
              <FVProject onAddProject={handleAddProject} />
            </CardContent>
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormProject;

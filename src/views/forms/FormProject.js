import React, { useState, useEffect } from 'react';
import { CardContent, Grid, Typography, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import FVProject from '../../components/forms/form-validation/FVProject';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'สร้างโครงการใหม่' },
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
        </TableRow> {/* Corrected closing tag */}
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
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3033/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (newProject) => {
    setProjects([...projects, newProject]);

    try {
      const response = await fetch('http://localhost:3033/save-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectName: newProject.name, data: newProject }),
      });

      if (!response.ok) {
        console.error('Error saving project:', response.statusText);
      } else {
        console.log('Project saved successfully');
        fetchProjects(); // Refresh the project list after adding a new project
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
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

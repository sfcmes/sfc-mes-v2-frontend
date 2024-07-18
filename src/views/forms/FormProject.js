import React, { useState, useEffect } from 'react';
import {
  CardContent,
  Grid,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import FVProject from '../../components/forms/form-validation/FVProject';
import ProjectModal from './ProjectModal'; // import the modal component

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'สร้างโครงการใหม่' }];

const ProjectTable = ({ projects, onView, onEdit }) => (
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
              Project Code
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
          <TableCell>
            <Typography variant="h6" fontWeight="500">
              Actions
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
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight="600">
                {project.project_code}
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
                {typeof project.progress === 'number' && !isNaN(project.progress) ? project.progress.toFixed(2) : 'N/A'}%
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
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button onClick={() => onView(project)} variant="contained" color="primary" size="small">
                  View
                </Button>
                <Button onClick={() => onEdit(project)} variant="contained" color="secondary" size="small">
                  Edit
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const FormProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Add isEditing state

  const fetchProjects = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/projects', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'), // Assuming token is stored in localStorage
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch projects: ${errorText}`);
        }
        const data = await response.json();
        setProjects(data); // Ensure the state is updated with the fetched data
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
};

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (newProject) => {
    try {
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'), // Assuming token is stored in localStorage
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save project: ${errorText}`);
      }

      fetchProjects(); // Refresh the project list after adding a new project
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project: ' + error.message);
    }
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsEditing(false); // Set editing state to false
    setModalOpen(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditing(true); // Set editing state to true
    setModalOpen(true);
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
        const response = await fetch(`http://localhost:3000/api/projects/${updatedProject.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'), // Assuming token is stored in localStorage
            },
            body: JSON.stringify(updatedProject),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update project: ${errorText}`);
        }

        await fetchProjects(); // Refresh the project list after updating a project
        setModalOpen(false);
    } catch (error) {
        console.error('Error updating project:', error);
        alert('Error updating project: ' + error.message);
    }
};

  return (
    <PageContainer title="สร้างโครงการใหม่" description="This is the form to create a new project.">
      <Breadcrumb title="สร้างโครงการใหม่" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="Projects Overview">
            <ProjectTable projects={projects} onView={handleViewProject} onEdit={handleEditProject} />
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
      <ProjectModal
        open={isModalOpen}
        project={selectedProject}
        onClose={() => setModalOpen(false)}
        onSave={handleUpdateProject}
        isEditing={isEditing} // Pass isEditing state to ProjectModal
      />
    </PageContainer>
  );
};

export default FormProject;

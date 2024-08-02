import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import WeeklyStats from '../../components/dashboards/modern/WeeklyStats';
import TopPerformers from '../../components/dashboards/modern/TopPerformers';
import Welcome from '../../layouts/full/shared/welcome/Welcome';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import { fetchProjects } from 'src/utils/api';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Dashboard',
  },
];

const Modern = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProjects();
        if (response && response.data && Array.isArray(response.data.projects)) {
          setProjects(response.data.projects);
        } else {
          console.error('Unexpected projects data structure:', response);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchData();
  }, []);

  const statusDisplayMap = {
    'Manufactured': 'ผลิตแล้ว',
    'In Transit': 'อยู่ระหว่างขนส่ง',
    'Transported': 'ขนส่งถึงที่หมาย',
    'Accepted': 'ตรวจรับแล้ว',
    'Installed': 'ติดตั้งแล้ว',
    'Rejected': 'ถูกปฏิเสธ'
  };

  const calculateProjectStats = (project) => {
    const totalComponents = project.sections.reduce((acc, section) => acc + section.components.length, 0);
    const statusCounts = {
      'Manufactured': 0,
      'In Transit': 0,
      'Transported': 0,
      'Accepted': 0,
      'Installed': 0,
      'Rejected': 0
    };
  
    project.sections.forEach((section) => {
      section.components.forEach((component) => {
        if (statusCounts.hasOwnProperty(component.status)) {
          statusCounts[component.status]++;
        }
      });
    });
  
    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      title: statusDisplayMap[status] || status,
      subtitle: '',
      percent: totalComponents > 0 ? Number(((count / totalComponents) * 100).toFixed(2)) : 0,
      count: count
    }));
  };

  const handleRowClick = (project) => {
    setSelectedProject(project);
  };

  return (
    <PageContainer title="Dashboard" description="Overview of project status">
      <Breadcrumb title="Dashboard" items={BCrumb} />
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <WeeklyStats
              stats={selectedProject ? calculateProjectStats(selectedProject) : []}
              projectName={selectedProject ? selectedProject.name : 'All Projects'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <TopPerformers projects={projects} onRowClick={handleRowClick} />
          </Grid>
        </Grid>
        <Box mt={3}>
          <Welcome />
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Modern;
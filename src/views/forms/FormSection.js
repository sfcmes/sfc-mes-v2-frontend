import React, { useState, useEffect } from 'react';
import { Grid, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import FVSection from '../../components/forms/form-validation/FVSection';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'สร้าง Section แต่ละโครงการ' },
];

const SectionTable = ({ sections }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="section table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" fontWeight="500">
                Project Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6" fontWeight="500">
                Section Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6" fontWeight="500">
                Status
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
          {sections.map((section) => (
            <TableRow hover key={section.section_id}>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  {section.project_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  {section.section_name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  sx={{
                    bgcolor:
                      section.status === 'In Progress'
                        ? (theme) => theme.palette.warning.light
                        : section.status === 'Completed'
                        ? (theme) => theme.palette.success.light
                        : section.status === 'Planning'
                        ? (theme) => theme.palette.info.light
                        : (theme) => theme.palette.secondary.light,
                    color:
                      section.status === 'In Progress'
                        ? (theme) => theme.palette.warning.main
                        : section.status === 'Completed'
                        ? (theme) => theme.palette.success.main
                        : section.status === 'Planning'
                        ? (theme) => theme.palette.info.main
                        : (theme) => theme.palette.secondary.main,
                    borderRadius: '8px',
                  }}
                  size="small"
                  label={section.status}
                />
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="subtitle2">
                  {section.components}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const FormSection = () => {
  const [sections, setSections] = useState([]);

  const fetchSections = async () => {
    try {
      const response = await fetch('http://localhost:3033/sections');
      const data = await response.json();
      console.log('Fetched sections:', data); // Log fetched sections
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddSection = async (newSection) => {
    try {
      const response = await fetch('http://localhost:3033/save-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSection),
      });

      if (!response.ok) {
        console.error('Error saving section:', response.statusText);
      } else {
        console.log('Section saved successfully');
        fetchSections(); // Refresh the sections list after adding a new section
      }
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  return (
    <PageContainer title="สร้าง Section แต่ละโครงการ" description="this is Form create new project page">
      <Breadcrumb title="สร้าง Section แต่ละโครงการ" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ParentCard title="Sections Overview">
            <SectionTable sections={sections} />
          </ParentCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <ParentCard title="สร้าง Section แต่ละโครงการ">
            <FVSection onAddSection={handleAddSection} />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default FormSection;

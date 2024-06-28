import React, { useState } from 'react'; 
import { Grid, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// common components
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';

// custom components
import FVSection from '../../components/forms/form-validation/FVSection';

const BCrumb = [
  { to: '/', title: 'Home', },
  { title: 'สร้าง Section แต่ละโครงการ', },
];

const mockProjects = [
  { code: 'UA', name: 'ลูกขั้นบันได UOB (TOWER A)' },
  { code: 'SKF', name: 'Skyrise (Tower F)' },
  { code: 'SKG', name: 'Skyrise (Tower G)' },
  { code: 'SKE', name: 'Skyrise (Tower E)' },
  { code: 'SKD', name: 'Skyrise (Tower D)' },
  { code: 'UB', name: 'ลูกขั้นบันได UOB (TOWER B)' },
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

const SectionTable = ({ sections }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="section table">
        <TableHead>
          <TableRow>
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
  const [sections, setSections] = useState(mockSections.UA);

  const handleAddSection = (newSection) => {
    setSections([...sections, newSection]);
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

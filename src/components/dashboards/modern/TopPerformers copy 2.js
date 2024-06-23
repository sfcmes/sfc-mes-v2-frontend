import React from 'react';
import DashboardCard from '../../shared/DashboardCard';
import CustomSelect from '../../forms/theme-elements/CustomSelect';
import {
  MenuItem,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TableContainer,
} from '@mui/material';

const projects = [
  {
    id: '58cd3eb8-e397-4676-9a51-db30f4f97e57',
    code: 'UA',
    name: 'ลูกขั้นบันได  UOB (TOWER A)',
    status: 'In Progress',
    progress: 65,
  },
  {
    id: '6f670de8-54f0-4af1-acb7-76f41c618e86',
    code: 'SKF',
    name: 'Skyrise (Tower F)',
    status: 'Completed',
    progress: 100,
  },
  {
    id: '89cdfe36-5b1b-4679-b737-3a8bcfd29618',
    code: 'SKG',
    name: 'Skyrise (Tower G)',
    status: 'In Progress',
    progress: 80,
  },
  {
    id: 'b856b64b-b25a-42ab-be7c-d37715f6df2c',
    code: 'SKE',
    name: 'Skyrise (Tower E)',
    status: 'Delayed',
    progress: 40,
  },
  {
    id: 'bc2d14b2-8ac1-4025-b338-d0c838ebe08d',
    code: 'SKD',
    name: 'Skyrise (Tower D)',
    status: 'In Progress',
    progress: 90,
  },
  {
    id: 'f7025e3b-6ab0-4b99-b8cb-3593fc2f9ce2',
    code: 'UB',
    name: 'ลูกขั้นบันได UOB (TOWER B)',
    status: 'In Progress',
    progress: 75,
  },
];

const TopProjects = () => {
  // for select
  const [month, setMonth] = React.useState('1');

  const handleChange = (event) => {
    setMonth(event.target.value);
  };

  return (
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
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};

export default TopProjects;
import React, { useState, forwardRef } from 'react';
import {
  TableCell,
  TableRow,
  IconButton,
  Typography,
  Collapse,
  Box,
  Table,
  TableBody,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SectionRow from './SectionRow';

const ProjectRow = forwardRef(({ project, onRowClick, isSmallScreen, onProjectUpdate }, ref) => {
  const [open, setOpen] = useState(false);

  // Check if project.sections exists and is an array, otherwise use an empty array
  const sections = Array.isArray(project.sections) ? project.sections : [];

  const totalComponents = sections.reduce(
    (acc, section) => acc + (Array.isArray(section.components) ? section.components.length : 0),
    0
  );

  const handleRowClick = () => {
    onRowClick(project);
  };

  const handleIconClick = (event) => {
    event.stopPropagation();
    setOpen(!open);
  };

  const handleSectionUpdate = (sectionId, updatedComponents) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, components: updatedComponents } : section
    );
    onProjectUpdate(project.id, { ...project, sections: updatedSections });
  };

  return (
    <>
      <TableRow onClick={handleRowClick} style={{ cursor: 'pointer' }} ref={ref}>
        <TableCell>
          <IconButton size="small" onClick={handleIconClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{project.project_code}</TableCell>
        {!isSmallScreen && <TableCell>{project.name}</TableCell>}
        {!isSmallScreen && <TableCell align="right">{sections.length}</TableCell>}
        <TableCell align="right">{totalComponents}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isSmallScreen ? 3 : 5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                ชั้น
              </Typography>
              <Table size="small">
                <TableBody>
                  {sections.map((section) => (
                    <SectionRow
                      key={section.id}
                      section={section}
                      projectCode={project.project_code}
                      isSmallScreen={isSmallScreen}
                      onComponentUpdate={(sectionId, updatedComponents) => handleSectionUpdate(sectionId, updatedComponents)}
                    />
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

export default ProjectRow;
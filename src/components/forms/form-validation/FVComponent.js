import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import PrecastComponentForm from './PrecastComponentForm';
import OtherComponentForm from './OtherComponentForm';
import { fetchProjects, fetchSectionsByProjectId } from 'src/utils/api';

const FVComponent = () => {
  const [tabValue, setTabValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await fetchProjects();
        setProjects(projectResponse.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProjectChange = async (event) => {
    const projectId = event.target.value;
    try {
      const sectionResponse = await fetchSectionsByProjectId(projectId);
      setSections(sectionResponse.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Precast Component" />
        <Tab label="Other Component" />
      </Tabs>
      <Box mt={3}>
        {tabValue === 0 && (
          <PrecastComponentForm
            projects={projects}
            sections={sections}
            onProjectChange={handleProjectChange}
          />
        )}
        {tabValue === 1 && (
          <OtherComponentForm
            projects={projects}
            sections={sections}
            onProjectChange={handleProjectChange}
          />
        )}
      </Box>
    </Box>
  );
};

export default FVComponent;

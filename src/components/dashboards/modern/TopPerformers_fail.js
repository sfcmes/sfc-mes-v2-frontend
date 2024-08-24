import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { fetchProjects } from 'src/utils/api';
import SearchBar from './SearchBar';
import ProjectList from './ProjectList';

const TopPerformers = ({ onRowClick }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    console.log('Current projects:', projects);
  }, [projects]);

  const loadProjects = useCallback(async (isInitialLoad = false) => {
    if (!hasMore && !isInitialLoad) return;
    try {
      setLoading(true);
      const response = await fetchProjects(isInitialLoad ? 1 : page, itemsPerPage, searchTerm);
      console.log('API response:', response); // Log the entire response
      const newProjects = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(newProjects)) {
        console.error('Unexpected projects data structure:', response);
        throw new Error('Unexpected data structure received from API');
      }
      setProjects(prevProjects => isInitialLoad ? newProjects : [...prevProjects, ...newProjects]);
      setHasMore(newProjects.length === itemsPerPage);
      if (!isInitialLoad) {
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
      setSnackbarMessage('Failed to load projects. Please try again later.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, hasMore]);

  useEffect(() => {
    loadProjects(true); // Initial load
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setProjects([]);
    setPage(1);
    setHasMore(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProjectUpdate = (projectId, updatedProject) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId ? updatedProject : project
      )
    );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 0 } }}>
          ข้อมูลโครงการ
        </Typography>
        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      </Box>
      <ProjectList
        projects={projects}
        onRowClick={onRowClick}
        isSmallScreen={isSmallScreen}
        onProjectUpdate={handleProjectUpdate}
        loadMore={() => loadProjects(false)}
        hasMore={hasMore}
        loading={loading}
      />
      {loading && projects.length === 0 && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box display="flex" justifyContent="center" my={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {projects.length === 0 && !loading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <Typography>ไม่พบโครงการที่คุณค้นหา.</Typography>
        </Box>
      )}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TopPerformers;
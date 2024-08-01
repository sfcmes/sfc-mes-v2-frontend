import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.setToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Authentication API
const loginUser = (data) => api.post('/auth/login', data);
const registerUser = (data) => api.post('/auth/register', data);

// User API
const fetchUserProfile = (userId) => api.get(`/users/${userId}`);
const fetchUserById = (userId) => api.get(`/users/${userId}`);
const updateUserProfile = (data) => api.put('/users/me', data);
const updateUserById = (userId, data) => api.put(`/users/${userId}`, data);
const deleteUserById = (userId) => api.delete(`/users/${userId}`);

// Projects API
const fetchProjects = async () => {
  try {
    const response = await api.get('/projects');
    console.log('Fetched projects:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};
const fetchProjectById = (projectId) => api.get(`/projects/${projectId}`);
const createProject = (data) => api.post('/projects', data);
const updateProject = (projectId, data) => api.put(`/projects/${projectId}`, data);
const deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

// Sections API
const fetchSectionsByProjectId = (projectId) => api.get(`/sections/projects/${projectId}/sections`);
const fetchSectionById = (sectionId) => api.get(`/sections/${sectionId}`);
const createSection = (data) => api.post('/sections', data);
const updateSection = (sectionId, data) => api.put(`/sections/${sectionId}`, data);
const deleteSection = (sectionId) => api.delete(`/sections/${sectionId}`);

// Components API
const fetchComponentsBySectionId = (sectionId) => api.get(`/components/section/${sectionId}`);
const fetchComponentsByProjectId = async (projectId) => {
  try {
    const response = await api.get(`/components/project/${projectId}`);
    console.log('Fetched components:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};
const createComponent = async (data) => {
  try {
    console.log('Creating component with data:', data);
    const response = await api.post('/components', data);
    console.log('Component created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating component:', error.response ? error.response.data : error);
    throw error;
  }
};
const addComponentHistory = async (data) => {
  try {
    const response = await api.post('/component-history', data);
    console.log('Component history added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding component history:', error.response ? error.response.data : error);
    throw error;
  }
};
const updateComponent = (componentId, data) => api.put(`/components/${componentId}`, data);
const deleteComponent = (componentId) => api.delete(`/components/${componentId}`);

export {
  api as default,
  loginUser,
  registerUser,
  fetchUserProfile,
  fetchUserById,
  updateUserProfile,
  updateUserById,
  deleteUserById,
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchSectionsByProjectId,
  fetchSectionById,
  createSection,
  updateSection,
  deleteSection,
  fetchComponentsBySectionId,
  fetchComponentsByProjectId,
  createComponent,
  updateComponent,
  deleteComponent,
  addComponentHistory,
};

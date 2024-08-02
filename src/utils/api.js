import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

let userId = null;

api.setToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Decode the token to get the user ID
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    userId = null;
  }
};

const uploadFileToS3 = async (file, componentId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('componentId', componentId); // Send component ID

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
export const createComponent = async (formData) => {
  try {
    const response = await api.post('/components', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating component:', error);
    throw error;
  }
};

// Authentication API
const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  if (response.data && response.data.token) {
    api.setToken(response.data.token);
  }
  return response;
};
// const registerUser = (data) => api.post('/auth/register', data);
const registerUser = (data) => api.post('/users', data);

const fetchRoles = () => api.get('/users/roles'); // Correct endpoint

// User API
// User API
// const fetchUserProfile = async () => {
//   if (!userId) {
//     throw new Error('User is not authenticated');
//   }
//   return api.get(`/users/${userId}`);
// };
const fetchUserProfile = async () => {
  try {
      const token = localStorage.getItem('token'); // Retrieve token from storage
      const response = await axios.get('/api/users/profile', { // Updated URL
          headers: {
              Authorization: `Bearer ${token}` // Send token in Authorization header
          }
      });
      console.log('User profile:', response.data);
  } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
  }
};
// const fetchUserById = (userId) => api.get(`/users/${userId}`);
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
// const createComponent = async (data) => {
//   try {
//     console.log('Creating component with data:', data);
//     const response = await api.post('/components', data);
//     console.log('Component created successfully:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Error creating component:', error.response ? error.response.data : error);
//     throw error;
//   }
// };
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

const fetchComponentById = async (componentId) => {
  try {
    const response = await api.get(`/components/${componentId}`);
    console.log('Fetched component details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching component details:', error);
    throw error;
  }
};

const fetchUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

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
  // createComponent,
  updateComponent,
  deleteComponent,
  addComponentHistory,
  fetchRoles,
  uploadFileToS3,
  fetchComponentById,
  
};

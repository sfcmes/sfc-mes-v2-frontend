import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export const fetchProjects = () => api.get('/projects');
export const fetchSectionsByProjectId = (projectId) => api.get(`/sections/${projectId}`);
export const fetchComponentsBySectionId = (sectionId) => api.get(`/components/${sectionId}`);

export const createProject = (data) => api.post('/projects', data);
export const createSection = (data) => api.post('/sections', data);
export const createComponent = (data) => api.post('/components', data);

export default api;

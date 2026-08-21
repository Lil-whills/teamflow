import axios from 'axios';

// In production on Vercel, set VITE_API_BASE_URL (e.g. https://teamflow-api.onrender.com)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// 1. Create Axios Instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Automatically attach Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 3. Authentication APIs
// ==========================================

export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

export const register = async (username, email, password, confirmPassword) => {
  const response = await api.post('/auth/register/', {
    username,
    email,
    password,
    confirm_password: confirmPassword,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout/');
  return response.data;
};

// ==========================================
// 4. Project APIs (Stage 1)
// ==========================================

export const getProjects = async () => {
  const response = await api.get('/api/projects/');
  return response.data;
};

export const getProject = async (projectCode) => {
  const response = await api.get(`/api/projects/${projectCode}/`);
  return response.data;
};

export const createProject = async ({ title, description, invite_emails = [] }) => {
  const response = await api.post('/api/projects/', {
    title,
    description,
    invite_emails,
  });
  return response.data;
};

export const updateProjectStatus = async (projectCode, status) => {
  const response = await api.patch(`/api/projects/${projectCode}/`, { status });
  return response.data;
};

export const deleteProject = async (projectCode) => {
  const response = await api.delete(`/api/projects/${projectCode}/`);
  return response.data;
};

export const getProjectAssignees = async (projectCode) => {
  const response = await api.get(`/api/projects/${projectCode}/assignees/`);
  return response.data;
};

export const inviteMember = async (projectCode, email) => {
  const response = await api.post(`/api/projects/${projectCode}/invite/`, { email });
  return response.data;
};

// ==========================================
// 5. Task APIs (Stage 2)
// ==========================================

export const getTasks = async (projectCode) => {
  const response = await api.get(`/api/projects/${projectCode}/tasks/`);
  return response.data;
};

export const createTask = async (projectCode, { title, description, assignee_email, due_date }) => {
  const response = await api.post(`/api/projects/${projectCode}/tasks/`, {
    title,
    description,
    assignee_email: assignee_email || null,
    due_date: due_date || null,
  });
  return response.data;
};

export const updateTask = async (projectCode, taskCode, updateData) => {
  const response = await api.patch(`/api/projects/${projectCode}/tasks/${taskCode}/`, updateData);
  return response.data;
};

export const deleteTask = async (projectCode, taskCode) => {
  const response = await api.delete(`/api/projects/${projectCode}/tasks/${taskCode}/`);
  return response.data;
};

export const getMyTasks = async () => {
  const response = await api.get('/api/my-tasks/');
  return response.data;
};

// ==========================================
// 6. Comment APIs
// ==========================================

export const getComments = async (projectCode, taskCode) => {
  const response = await api.get(`/api/projects/${projectCode}/tasks/${taskCode}/comments/`);
  return response.data;
};

export const addComment = async (projectCode, taskCode, commentText) => {
  const response = await api.post(`/api/projects/${projectCode}/tasks/${taskCode}/comments/`, {
    comment: commentText,
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/api/comments/${commentId}/`);
  return response.data;
};

export default api;
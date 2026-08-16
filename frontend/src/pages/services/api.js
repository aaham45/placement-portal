// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Student APIs
export const studentRegister = (data) => api.post('/auth/student/register', data);
export const studentLogin = (data) => api.post('/auth/student/login', data);

// ✅ Company APIs
export const companyRegister = (data) => api.post('/auth/company/register', data);
export const companyLogin = (data) => api.post('/auth/company/login', data);

// ✅ Admin APIs
export const adminLogin = (data) => api.post('/auth/admin/login', data);

// ✅ Google Login
export const googleLogin = (data) => api.post('/auth/google', data);

// ✅ Forgot & Reset Password
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

export default api;
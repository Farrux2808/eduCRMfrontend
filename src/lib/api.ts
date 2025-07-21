import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getTeachers: () => api.get('/users/teachers'),
  getStudents: () => api.get('/users/students'),
  getParents: () => api.get('/users/parents'),
};

// Organizations API
export const organizationsApi = {
  getAll: () => api.get('/organizations'),
  getById: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  getActive: () => api.get('/organizations/active'),
  getExpired: () => api.get('/organizations/expired'),
  getStats: () => api.get('/organizations/stats'),
};

// Groups API
export const groupsApi = {
  getAll: () => api.get('/groups'),
  getById: (id: string) => api.get(`/groups/${id}`),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  getActive: () => api.get('/groups/active'),
  getByTeacher: (teacherId: string) => api.get(`/groups/teacher/${teacherId}`),
  getByStudent: (studentId: string) => api.get(`/groups/student/${studentId}`),
  addStudent: (groupId: string, studentId: string) => api.post(`/groups/${groupId}/students/${studentId}`),
  removeStudent: (groupId: string, studentId: string) => api.delete(`/groups/${groupId}/students/${studentId}`),
};

// Courses API
export const coursesApi = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.patch(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  getActive: () => api.get('/courses/active'),
};

// Attendance API
export const attendanceApi = {
  getAll: () => api.get('/attendance'),
  getById: (id: string) => api.get(`/attendance/${id}`),
  create: (data: any) => api.post('/attendance', data),
  bulkCreate: (data: any[]) => api.post('/attendance/bulk', data),
  update: (id: string, data: any) => api.patch(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  getByStudent: (studentId: string) => api.get(`/attendance/student/${studentId}`),
  getByGroup: (groupId: string) => api.get(`/attendance/group/${groupId}`),
  getByDate: (date: string) => api.get(`/attendance/date/${date}`),
  getStats: (studentId: string, groupId?: string) => 
    api.get(`/attendance/stats/${studentId}${groupId ? `?groupId=${groupId}` : ''}`),
};

// Grades API
export const gradesApi = {
  getAll: () => api.get('/grades'),
  getById: (id: string) => api.get(`/grades/${id}`),
  create: (data: any) => api.post('/grades', data),
  bulkCreate: (data: any[]) => api.post('/grades/bulk', data),
  update: (id: string, data: any) => api.patch(`/grades/${id}`, data),
  delete: (id: string) => api.delete(`/grades/${id}`),
  getByStudent: (studentId: string) => api.get(`/grades/student/${studentId}`),
  getByGroup: (groupId: string) => api.get(`/grades/group/${groupId}`),
  getStudentReport: (studentId: string, groupId?: string) => 
    api.get(`/grades/report/student/${studentId}${groupId ? `?groupId=${groupId}` : ''}`),
  getGroupReport: (groupId: string) => api.get(`/grades/report/group/${groupId}`),
};

// Payment API
export const paymentApi = {
  getAll: () => api.get('/payment'),
  getById: (id: string) => api.get(`/payment/${id}`),
  create: (data: any) => api.post('/payment', data),
  update: (id: string, data: any) => api.patch(`/payment/${id}`, data),
  delete: (id: string) => api.delete(`/payment/${id}`),
  getByStudent: (studentId: string) => api.get(`/payment/student/${studentId}`),
  getByGroup: (groupId: string) => api.get(`/payment/group/${groupId}`),
  getReport: (month: number, year: number) => 
    api.get(`/payment/report?month=${month}&year=${year}`),
  calculateTeacherSalary: (data: any) => api.post('/payment/teacher-salary/calculate', data),
  generateTeacherSalary: (data: any) => api.post('/payment/teacher-salary/generate', data),
  getTeacherSalaries: (teacherId?: string) => 
    api.get(`/payment/teacher-salary${teacherId ? `?teacherId=${teacherId}` : ''}`),
};

// Schedule API
export const scheduleApi = {
  getAll: () => api.get('/schedule'),
  getById: (id: string) => api.get(`/schedule/${id}`),
  create: (data: any) => api.post('/schedule', data),
  update: (id: string, data: any) => api.patch(`/schedule/${id}`, data),
  delete: (id: string) => api.delete(`/schedule/${id}`),
  getWeekly: () => api.get('/schedule/weekly'),
  getByTeacher: (teacherId: string) => api.get(`/schedule/teacher/${teacherId}`),
  getByGroup: (groupId: string) => api.get(`/schedule/group/${groupId}`),
};

// Reports API
export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getFinancial: (startDate: string, endDate: string) => 
    api.get(`/reports/financial?startDate=${startDate}&endDate=${endDate}`),
  getAttendance: (startDate: string, endDate: string) => 
    api.get(`/reports/attendance?startDate=${startDate}&endDate=${endDate}`),
  getAcademic: (startDate: string, endDate: string) => 
    api.get(`/reports/academic?startDate=${startDate}&endDate=${endDate}`),
  getTeacherPerformance: () => api.get('/reports/teacher-performance'),
  getStudentPerformance: () => api.get('/reports/student-performance'),
};

// Super Admin API
export const superAdminApi = {
  getStats: () => api.get('/super-admin/stats'),
  getOrganizationDetails: () => api.get('/super-admin/organizations-details'),
  getRevenueAnalytics: (startDate: string, endDate: string) => 
    api.get(`/super-admin/revenue-analytics?startDate=${startDate}&endDate=${endDate}`),
  getUserGrowthAnalytics: () => api.get('/super-admin/user-growth-analytics'),
};
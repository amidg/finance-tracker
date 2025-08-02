import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const getKeywords = async () => {
  const response = await api.get('/keywords');
  return response.data;
};

export const createKeyword = async (keyword, tag) => {
  const response = await api.post('/keywords', { keyword, tag });
  return response.data;
};

export const deleteKeyword = async (keywordId) => {
  const response = await api.delete(`/keywords/${keywordId}`);
  return response.data;
};

export const retagAllTransactions = async () => {
  const response = await api.post('/transactions/retag');
  return response.data;
};

export const getMonthlyChartData = async (year, month) => {
  const response = await api.get(`/charts/monthly?year=${year}&month=${month}`);
  return response.data;
};

export const getYearlyChartData = async (year) => {
  const response = await api.get(`/charts/yearly?year=${year}`);
  return response.data;
};

export const getAllTimeChartData = async () => {
  const response = await api.get('/charts/all-time');
  return response.data;
};

export default api;
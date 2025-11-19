// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.port === '30401' ? 'http://' + window.location.hostname + ':30400' : '');

export default {
  apiUrl: API_BASE_URL
};

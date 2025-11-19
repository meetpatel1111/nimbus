// API Configuration
// If running on port 30401 (frontend-only), point to backend on 30400
// Otherwise use relative URLs (when served from backend on 30400)
export const API_BASE_URL = window.location.port === '30401' 
  ? `http://${window.location.hostname}:30400`
  : '';

export default {
  apiUrl: API_BASE_URL
};

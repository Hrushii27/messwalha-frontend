import axios from "axios";

// ✅ Base URL (Production + Local support)
const API_BASE_URL =
  import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
    : "https://messwalha-api-pg-360404ae0804.herokuapp.com/api";

console.log('🚀 API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log('📡 Axios matches Base URL:', API_BASE_URL);

// ✅ REQUEST INTERCEPTOR (Attach Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Backend not reachable or network error");
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Prepend backend base URL (removing /api from the end if present)
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default api;

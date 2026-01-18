import axios from "axios";

// In production, there is no localhost so we make this dynamic
// Production: frontend and backend served from same domain, use relative path
// Development: backend on localhost:3000
const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;

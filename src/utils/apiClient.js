// src/utils/apiClient.js
import axios from "axios";

const apiClient = axios.create({
//   baseURL: "http://127.0.0.1:8000/api",
//   baseURL: "http://182.48.80.103:8090/api",
  baseURL: "http://182.48.80.76:8081/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // set to true if using cookies / sanctum auth
});

// Optional: interceptors to handle auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 👈 adjust if storing JWT differently
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

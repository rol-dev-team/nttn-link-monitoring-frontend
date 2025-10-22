import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PARTNER_API_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use(
  (config) => {
    const getToken = localStorage.getItem("myapp_auth");
    if (getToken) {
      config.headers.Authorization = `Bearer ${getToken.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

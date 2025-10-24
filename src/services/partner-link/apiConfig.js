
import axios from "axios";

const axiosInstance = axios.create({
    baseURL:
        import.meta.env.VITE_PARTNER_API_URL || "http://127.0.0.1:8000/api",
});

axiosInstance.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem("myapp_auth");
        if (authData) {
            try {
                // Try to parse as JSON first
                const parsedAuth = JSON.parse(authData);
                const token =
                    parsedAuth.token || parsedAuth.access_token || parsedAuth;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // If it's not JSON, use it directly as token
                config.headers.Authorization = `Bearer ${authData}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem("myapp_auth");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

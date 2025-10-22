import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_NTTN_API_URL || "http://127.0.0.1:8000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_NTTN_API_URL || "http://localhost:8001/api",
// });

// // ✅ Attach token automatically on every request
// api.interceptors.request.use(
//   (config) => {
//     const authData = JSON.parse(localStorage.getItem("myapp_auth") || "{}");
//     const token = authData?.token;

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

import api from "./api";

import axiosInstance from "./partner-link/apiConfig";


// A simple function to construct query parameters from an object
const buildQueryParams = (filters) => {
  const params = new URLSearchParams();
  for (const key in filters) {
    if (filters[key] !== null && filters[key] !== undefined) {
      params.append(key, filters[key]);
    }
  }
  return params.toString();
};

/* -------------------------------------------------
   ✅ MODIFIED: fetchBWModifications (now handles date range transformation)
   ------------------------------------------------- */
// export const fetchBWModifications = async (filters = {}) => {
//   try {
//     // Create a new object to hold the formatted parameters
//     const formattedFilters = { ...filters };

//     // Iterate through filters to transform date range arrays
//     for (const key in filters) {
//       const value = filters[key];

//       // Check for a date range array (e.g., [date1, date2])
//       if (Array.isArray(value) && value.length === 2) {
//         // Delete the original array entry
//         delete formattedFilters[key];

//         // Add the new start and end parameters
//         formattedFilters[`${key}_start`] = value[0];
//         formattedFilters[`${key}_end`] = value[1];
//       }
//     }

//     // Pass the formatted filters directly to axios's `params` key
//     // Axios will handle the URL encoding correctly
//     const response = await api.get(`/bw-modifications/`, {
//       params: formattedFilters
//     });

//     const totalCount = response.headers['x-total-count'];

//     return {
//       data: response.data,
//       total: totalCount
//     };
//   } catch (error) {
//     throw error;
//   }
// };

// export const createBWModification = async (data) => {
//   try {
//     const response = await api.post('/bw-modifications/', data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateBWModification = async (id, data) => {
//   try {
//     const response = await api.put(`/bw-modifications/${id}/`, data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };









export const createBWModification = async (payload) => {
  try {
    const response = await axiosInstance.post("/bw-modifications", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating BW modification:", error);
    throw error;
  }
};

export const updateBWModification = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/bw-modifications/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating BW modification:", error);
    throw error;
  }
};

// export const fetchBWModifications = async () => {
//   try {
//     const response = await axiosInstance.get("/bw-modifications");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching BW modifications:", error);
//     throw error;
//   }
// };

export const fetchBWModifications = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/bw-modifications", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching BW modifications:", error);
    throw error;
  }
};

export const fetchBWModificationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/bw-modifications/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching BW modification:", error);
    throw error;
  }
};

export const deleteBWModification = async (id) => {
  try {
    const response = await axiosInstance.delete(`/bw-modifications/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting BW modification:", error);
    throw error;
  }
};

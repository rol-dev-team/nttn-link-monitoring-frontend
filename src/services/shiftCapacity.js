// import api from "./api";

// // export const createShiftCapacity = async (payload) => {
// //   try {
// //     const response = await api.post("/capacity-shifting/", payload);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// export const createShiftCapacity = async (payload) => {
//   try {
//     console.log("🔄 Creating shift capacity with:", payload);
//     const response = await api.post("/capacity-shifting/", payload);
//     console.log("✅ Create successful:", response.data);
//     return response.data;
//   } catch (error) {
//     const errorDetails = {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message,
//       url: error.config?.url
//     };
//     console.error("❌ Create failed:", errorDetails);
//     throw new Error(error.response?.data ? JSON.stringify(error.response.data) : error.message);
//   }
// };

// export const fetchShiftCapacities = async () => {
//   try {
//     const response = await api.get("/capacity-shifting/");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchShiftCapacity = async (id) => {
//   try {
//     const response = await api.get(`/capacity-shifting/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// // export const updateShiftCapacity = async (id, data) => {
// //   try {
// //     const response = await api.put(`/capacity-shifting/${id}/`, data);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// export const updateShiftCapacity = async (id, data) => {
//   try {
//     console.log("🔄 Updating shift capacity:", id, data);
//     const response = await api.put(`/capacity-shifting/${id}/`, data);
//     console.log("✅ Update successful:", response.data);
//     return response.data;
//   } catch (error) {
//     const errorDetails = {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message,
//       url: error.config?.url
//     };
//     console.error("❌ Update failed:", errorDetails);
//     throw new Error(error.response?.data ? JSON.stringify(error.response.data) : error.message);
//   }
// };

// export const deleteShiftCapacity = async (id) => {
//   try {
//     const response = await api.delete(`/capacity-shifting/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

import api from "./api";

export const createShiftCapacity = async (payload) => {
  try {
    console.log("🔄 Creating shift capacity with:", payload);
    const response = await api.post("/capacity-shifting/", payload);
    console.log("✅ Create successful:", response.data);
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    };
    console.error("❌ Create failed:", errorDetails);
    throw new Error(error.response?.data ? JSON.stringify(error.response.data) : error.message);
  }
};

/* -------------------------------------------------
   ✅ MODIFIED: fetchShiftCapacities (now handles date range transformation)
   ------------------------------------------------- */
/**
 * Fetches capacity shifting records from the backend with support for filtering and pagination.
 *
 * @param {Object} [filters={}] - Contains query parameters (e.g., page, limit, created_at).
 * @returns {Promise<{data: Array, total: number}>} List of records and the total count.
 */
export const fetchShiftCapacities = async (filters = {}) => {
  try {
    // 1. Create a new object for the final query parameters
    const params = { ...filters };

    // 2. Iterate through the filters to transform date range arrays
    for (const key in filters) {
      const value = filters[key];

      // Check if the value is an array of two dates (our date range format)
      if (Array.isArray(value) && value.length === 2) {
        // Delete the original key from the parameters object
        delete params[key];

        // Add the new start and end date parameters
        params[`${key}_start`] = value[0];
        params[`${key}_end`] = value[1];
      }
    }

    // 3. Make the API request with the formatted parameters
    const response = await api.get("/capacity-shifting/", { params });

    // The total count is now in a custom header from the backend
    const total = response.headers["x-total-count"];

    // Return both the data and the total count
    return { data: response.data, total: parseInt(total, 10) };
  } catch (error) {
    throw error;
  }
};

export const fetchShiftCapacity = async (id) => {
  try {
    const response = await api.get(`/capacity-shifting/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateShiftCapacity = async (id, data) => {
  try {
    console.log("🔄 Updating shift capacity:", id, data);
    const response = await api.put(`/capacity-shifting/${id}/`, data);
    console.log("✅ Update successful:", response.data);
    return response.data;
  } catch (error) {
    const errorDetails = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    };
    console.error("❌ Update failed:", errorDetails);
    throw new Error(error.response?.data ? JSON.stringify(error.response.data) : error.message);
  }
};

export const deleteShiftCapacity = async (id) => {
  try {
    const response = await api.delete(`/capacity-shifting/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
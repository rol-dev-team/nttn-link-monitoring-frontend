import api from "./api";
// export const createWorkOrder = async (payload) => {
//   try {
//     const response = await api.post("/work-orders/", payload);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };



/* -------------------------------------------------
   ✅ MODIFIED: fetchWorkOrders (Updated for Date Range Filtering)
   ------------------------------------------------- */
/**
 * Fetches work orders from the backend with support for filtering and pagination.
 *
 * @param {Object} [filters={}] - Contains query parameters (e.g., page, limit, sbu_id).
 * @returns {Promise<{data: Array, totalCount: number}>} List of work orders and the total count.
 */
export const fetchWorkOrders = async (filters = {}) => {
  try {
    // 1. Create a new object for the final query parameters
    const params = { ...filters };

    // 2. Iterate through the filters to handle date ranges
    //    We assume the date range filters are passed in as an object,
    //    e.g., { requested_delivery: ['2025-08-22T...', '2025-09-02T...'] }
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
    const response = await api.get("/work-orders/", {
      params: params,
    });

    // 💡 Read the custom header from the backend for the total record count
    const headerValue = response.headers["x-total-count"];

    // Convert to integer, defaulting to 0 if the header is missing or invalid
    const totalCount = parseInt(headerValue, 10) || 0;

    // Return a structured object containing the paginated data and the total count
    return {
      data: response.data,
      totalCount: totalCount,
    };
  } catch (error) {
    throw error;
  }
};
export const createWorkOrder = async (payload) => {
  try {
    const response = await api.post("/combined-submission/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const fetchWorkOrders = async () => {
//   try {
//     const response = await api.get("/work-orders/");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const fetchWorkOrder = async (id) => {
  try {
    const response = await api.get(`/work-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWorkOrder = async (id, data) => {
  try {
    const response = await api.put(`/work-orders/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteWorkOrder = async (id) => {
  try {
    const response = await api.delete(`/work-orders/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


import api from "./api";

// Create new survey
export const createSurvey = async (payload) => {
  try {
    const response = await api.post("/surveys/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// /* -------------------------------------------------
//    ✅ MODIFIED: fetchSurveys (Primary fetcher now handles date range transformation)
//    ------------------------------------------------- */
// /**
//  * Fetches surveys from the backend, applying any provided filters.
//  * @param {Object} [filters={}] - Query parameters for filtering/limiting.
//  * @returns {Promise<Array>} List of filtered surveys.
//  */
// export const fetchSurveys = async (filters = {}) => {
//   try {
//     // New object to build the final, correctly formatted query parameters
//     const params = { ...filters }; // Start with a copy of all filters

//     // Iterate over the incoming filters to transform date range arrays
//     for (const key in filters) {
//       const value = filters[key];

//       // Check if the value is an array of two dates (our date range format)
//       if (Array.isArray(value) && value.length === 2) {
//         // Delete the original key from the parameters object
//         delete params[key];

//         // Add the new start and end date parameters
//         params[`${key}_start`] = value[0];
//         params[`${key}_end`] = value[1];
//       }
//     }

//     const response = await api.get("/surveys/", {
//       params: params,
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

/* -------------------------------------------------
   ✅ CRITICAL FIX: fetchSurveys (Reading X-Total-Count Header from Axios)
   ------------------------------------------------- */
/**
 * Fetches surveys from the backend, applying any provided filters.
 * It transforms date range arrays into _start and _end query parameters.
 * @param {Object} [filters={}] - Query parameters for filtering/limiting.
 * @returns {Promise<{data: Array, totalCount: number}>} List of filtered surveys and the total count.
 */
export const fetchSurveys = async (filters = {}) => {
  try {
    // New object to build the final, correctly formatted query parameters
    const params = { ...filters }; // Start with a copy of all filters

    // Iterate over the incoming filters to transform date range arrays
    for (const key in filters) {
      const value = filters[key];

      // Check if the value is an array of two dates (e.g., submition: ['2024-01-01', '2024-01-31'])
      if (Array.isArray(value) && value.length === 2) {
        // Delete the original key from the parameters object
        delete params[key];

        // Add the new start and end date parameters
        if (value[0]) {
          params[`${key}_start`] = value[0]; // e.g., submition_start
        }
        if (value[1]) {
          params[`${key}_end`] = value[1];   // e.g., submition_end
        }
      }
    }

    const response = await api.get("/surveys/", {
      params: params,
    });

    // 🔑 FIX: Extract the total count from the custom header 'X-Total-Count'.
    // Axios response headers are typically converted to lowercase.
    // We try the standard lowercase key first, then the original casing as a fallback.
    const totalCountHeader = response.headers["x-total-count"] || response.headers["X-Total-Count"];

    // Validate the header value and convert to integer, defaulting to 0 if invalid
    const totalCount = parseInt(totalCountHeader || 0, 10);

    // 🔑 Return an object containing both the data and the validated total count
    return {
      data: response.data,
      totalCount: totalCount,
    };
  } catch (error) {
    // Allows the calling component (Survey.jsx) to handle the error notification
    throw error;
  }
};
// -------------------------------------------------


// Get surveys by specific type (KEEPING FOR LEGACY SUPPORT)
export const fetchSurveysByType = async () => {
  try {
    const response = await api.get("/surveys/all/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single survey
export const fetchSurvey = async (id) => {
  try {
    const response = await api.get(`/surveys/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update survey
export const updateSurvey = async (id, data) => {
  try {
    const response = await api.put(`/surveys/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete survey
export const deleteSurvey = async (id) => {
  try {
    const response = await api.delete(`/surveys/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* -------------------------------------------------
   ✅ MODIFIED: Legacy functions refactored to use the new fetchSurveys internally
   Their external API remains the same to avoid breaking existing code.
   ------------------------------------------------- */

/**
 * Fetch surveys within a date range (inclusive).
 * @param {Date|null} startDate
 * @param {Date|null} endDate
 * @returns {Promise<Array>} surveys
 */
export const fetchSurveysByDateRange = async (startDate, endDate) => {
  const filters = {};
  if (startDate) filters.start = startDate.toISOString().slice(0, 10);
  if (endDate) filters.end = endDate.toISOString().slice(0, 10);

  // Use the new, robust fetcher to handle the API call
  return fetchSurveys(filters);
};

/* -------------------------------------------------
   Fetch surveys for a specific client
   ------------------------------------------------- */
export const fetchSurveysByClient = async (clientId) => {
  const filters = { client: clientId };

  // Use the new, robust fetcher to handle the API call
  return fetchSurveys(filters);
};
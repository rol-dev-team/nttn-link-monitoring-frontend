import axiosInstance from "./partner-link/apiConfig";
import api from "./api";

// Create new survey
export const createSurvey = async (payload) => {
  try {
    const response = await axiosInstance.post("/surveys/", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchSurveys = async (filters = {}) => {
  try {
    const response = await axiosInstance.get("/surveys", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchClientDetailCategoryAndClientWise = async (payload) => {
  try {
    const response = await axiosInstance.post("/category-wise-client-details", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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


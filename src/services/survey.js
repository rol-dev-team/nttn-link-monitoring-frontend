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
    const response = await axiosInstance.put(`/surveys/${id}/`, data);
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


export const fetchSurveysByDateRange = async (startDate, endDate) => {
  const filters = {};
  if (startDate) filters.start = startDate.toISOString().slice(0, 10);
  if (endDate) filters.end = endDate.toISOString().slice(0, 10);
  return fetchSurveys(filters);
};


export const fetchSurveysByClient = async (clientId) => {
  const filters = { client: clientId };
  return fetchSurveys(filters);
};





////
export const fetchClientDetailsByClient = async (clientId, categoryId) => {
  try {
    const response = await axiosInstance.get(`/client-details/${clientId}/${categoryId}`);
    if (response.data && response.data.success !== false) {
     
      if (response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Client not found');
    }
  } catch (error) {
    console.error('❌ Error fetching client details:', error);
    throw error;
  }
};


export const fetchSurveysByClientLaravel = async (clientId, categoryId) => {
  try {
    const response = await axiosInstance.get(`/surveys-id-by-client/${clientId}/${categoryId}`);
    
    if (response.data && response.data.success !== false) {
      return response.data.data || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return [];
  }
};


export const fetchSurveysDetailsByClient = async (clientId, categoryId, nttnSurveyId) => {
  try {
    const response = await axiosInstance.get(`/surveys-details-by-client/${clientId}/${categoryId}/${nttnSurveyId}`);
    
    if (response.data && response.data.success !== false) {
      return response.data.data || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return [];
  }
};

export const fetchRatesByNttn = async (nttnId) => {
  try {
    const response = await axiosInstance.get(`/rates/nttn/${nttnId}`);
    return response.data;
  } catch (error) {
    console.error('API Error fetching rates by NTTN ID:', error);
    throw new Error('Failed to fetch rates from the server.');
  }
};

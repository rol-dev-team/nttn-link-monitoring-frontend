// import axiosInstance from '../services/partner-link/apiConfig';
// export const createAggregator = async (payload) => {
//   try {
//     const response = await axiosInstance.post('aggregator/', payload);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchAggregators = async () => {
//   try {
//     const response = await axiosInstance.get('/aggregator/');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchAggregator = async (id) => {
//   try {
//     const response = await axiosInstance.get(`/aggregator/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const updateAggregator = async (id, data) => {
//   try {
//     const response = await axiosInstance.put(`/aggregator/${id}/`, data);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const deleteAggregator = async (id) => {
//   try {
//     const response = await axiosInstance.delete(`/aggregator/${id}/`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };


// src/services/aggregator.js
import axiosInstance from '../services/partner-link/apiConfig';

/* ---------- Aggregator CRUD ---------- */
export const createAggregator = async (payload) => {
  try {
    const response = await axiosInstance.post('/aggregator/', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAggregators = async () => {
  try {
    const response = await axiosInstance.get('/aggregator/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAggregator = async (id) => {
  try {
    const response = await axiosInstance.get(`/aggregator/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAggregator = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/aggregator/${id}/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAggregator = async (id) => {
  try {
    const response = await axiosInstance.delete(`/aggregator/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/* ---------- Dropdown / Select Options ---------- */

// export const fetchSBUs = async () => {
//   try {
//     const response = await axiosInstance.get('/sbu/');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchAggLandmarks = async () => {
//   try {
//     const response = await axiosInstance.get('/aggregation-landmarks/');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchNTTNs = async () => {
//   try {
//     const response = await axiosInstance.get('/nttn/');
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const fetchLinkTypes = async () => {
//   try {
//     const response = await axiosInstance.get('/link-types/');
//     return response.data; // expected: { data: [{id, name}, ...] }
//   } catch (error) {
//     throw error;
//   }
// };

import axios from 'axios';

const API_URL = 'http://localhost:6000/get_data';

export const fetchGeoData = async (lat, lon) => {
  try {
    const response = await axios.post(API_URL, { lat, lon });
    return response.data;
  } catch (error) {
    console.error('Error fetching geodata:', error);
    throw error;
  }
};

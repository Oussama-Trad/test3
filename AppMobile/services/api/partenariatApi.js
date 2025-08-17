import axios from 'axios';

const API_URL = 'http://localhost:5000/api/partenariats';

export const getAllPartenariats = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (e) {
    return [];
  }
};

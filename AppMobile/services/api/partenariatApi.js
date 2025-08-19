import axios from 'axios';

const API_URL = 'http://172.20.10.2:5000/api/partenariats';

export const getAllPartenariats = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (e) {
    return [];
  }
};

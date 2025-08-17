// Service d'API pour les réclamations côté mobile
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const uploadPieceJointe = async (file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'piece_jointe.jpg',
    type: file.type || 'image/jpeg',
  });
  const res = await axios.post(`${BASE_URL}/reclamations/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.piece_jointe; // chemin à mettre dans la réclamation
};

export const createReclamation = async (reclamation) => {
  const res = await axios.post(`${BASE_URL}/reclamations`, reclamation);
  return res.data;
};

export const getReclamations = async (employeId) => {
  const res = await axios.get(`${BASE_URL}/reclamations`, {
    params: { employeId },
  });
  return res.data;
};

export const getLocations = async () => {
  const res = await axios.get(`${BASE_URL}/locations-full`);
  return res.data;
};

export const getDepartments = async (locationId) => {
  const res = await axios.get(`${BASE_URL}/departments-full`);
  // Filtrer côté client si besoin
  if (locationId) {
    return res.data.filter(dep => dep.locationId === locationId);
  }
  return res.data;
};

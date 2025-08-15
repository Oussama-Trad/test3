// Service pour les appels API liés aux actualités
const API_URL = 'http://localhost:5000/api';

export async function getActualites(token) {
  const res = await fetch(`${API_URL}/actualites`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

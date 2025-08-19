// Service pour les appels API liés aux actualités
const API_URL = 'http://172.20.10.2:5000/api';

export async function getActualites(token) {
  const res = await fetch(`${API_URL}/actualites`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

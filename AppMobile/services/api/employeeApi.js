// Service pour les appels API liés à l'employé
const API_URL = 'http://localhost:5000/api';

export async function login(adresse1, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adresse1, password })
  });
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getProfile(token) {
  const res = await fetch(`${API_URL}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function updateProfile(token, data) {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getLocations() {
  const res = await fetch(`${API_URL}/locations`);
  return res.json();
}

export async function getDepartments(location) {
  const res = await fetch(`${API_URL}/departments/${location}`);
  return res.json();
}

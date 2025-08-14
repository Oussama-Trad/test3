// Service pour les appels API liés aux documents
const API_URL = 'http://localhost:5000/api';

export async function getDocumentTypes(token) {
  const res = await fetch(`${API_URL}/document-types`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  return res.json();
}

export async function createDocumentRequest(token, data) {
  const res = await fetch(`${API_URL}/document-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getDocumentRequests(token) {
  const res = await fetch(`${API_URL}/document-requests`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

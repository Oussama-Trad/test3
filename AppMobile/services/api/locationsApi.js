import { API_URL } from './employeeApi';

export async function getLocationsFull() {
  console.log('FETCH URL:', `${API_URL}/locations-full`);
  const res = await fetch(`${API_URL}/locations-full`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('Erreur API locations');
  return res.json();
}

export async function getDepartmentsFull() {
  console.log('FETCH URL:', `${API_URL}/departments-full`);
  const res = await fetch(`${API_URL}/departments-full`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('Erreur API departments');
  return res.json();
}

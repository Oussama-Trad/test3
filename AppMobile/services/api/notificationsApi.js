export const API_URL = 'http://localhost:5000/api';

export async function getConversations(employeeId) {
  const res = await fetch(`${API_URL}/conversations?employeeId=${encodeURIComponent(employeeId)}`);
  return res.json();
}

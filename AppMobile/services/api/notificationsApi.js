export const API_URL = 'http://172.20.10.2:5000/api';

export async function getConversations(employeeId) {
  const res = await fetch(`${API_URL}/conversations?employeeId=${encodeURIComponent(employeeId)}`);
  return res.json();
}

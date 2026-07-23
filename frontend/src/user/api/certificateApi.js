const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function verifyCertificatePublic(certNo) {
  const response = await fetch(
    `${API_BASE}/api/user/certificates/verify/${encodeURIComponent(certNo.trim())}`
  );
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Verification failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

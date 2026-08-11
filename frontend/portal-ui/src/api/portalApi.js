const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Try again.");
  }

  return data;
}

export function sendOtp(mail) {
  return request("/api/portal/otp/send", {
    method: "POST",
    body: JSON.stringify({ mail }),
  });
}

export function verifyOtp(mail, otp) {
  return request("/api/portal/otp/verify", {
    method: "POST",
    body: JSON.stringify({ mail, otp }),
  });
}

export function createStore({ store_name, name, mail, password }) {
  return request("/api/portal/tenants", {
    method: "POST",
    body: JSON.stringify({ store_name, name, mail, password }),
  });
}

export function getStatusByTenantId(tenantId) {
  return request(`/api/portal/tenants/${encodeURIComponent(tenantId)}/status`);
}

export function getStatusByMail(mail) {
  return request(`/api/portal/tenants/status?mail=${encodeURIComponent(mail)}`);
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4100";
const TOKEN_KEY = "storeforge_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// Auth
export const login = (mail, password) =>
  request("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ mail, password }),
  });

export const getMe = () => request("/api/admin/auth/me");

// Config
export const getConfig = () => request("/api/admin/config");
export const updateConfig = (patch) =>
  request("/api/admin/config", { method: "PATCH", body: JSON.stringify(patch) });

// Products
export const getProducts = () => request("/api/admin/products");
export const addProduct = (product) =>
  request("/api/admin/products", { method: "POST", body: JSON.stringify(product) });
export const deleteProduct = (id) =>
  request(`/api/admin/products/${id}`, { method: "DELETE" });

// Orders
export const getOrders = (status) =>
  request(`/api/admin/orders${status ? `?status=${status}` : ""}`);
export const updateOrderStatus = (id, status) =>
  request(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// Reviews
export const getReviews = (productId) =>
  request(`/api/admin/reviews${productId ? `?productId=${productId}` : ""}`);

// Assets
export const getUploadSignature = (folder) =>
  request("/api/admin/assets/upload-signature", {
    method: "POST",
    body: JSON.stringify({ folder }),
  });

export const updateLogo = (payload) =>
  request("/api/admin/assets/logo", { method: "PATCH", body: JSON.stringify(payload) });

export const updateFavicon = (url) =>
  request("/api/admin/assets/favicon", { method: "PATCH", body: JSON.stringify({ url }) });

// Payment settings
export const getPaymentSettings = () => request("/api/admin/payment-settings");
export const updatePaymentSettings = (provider, apiKey) =>
  request("/api/admin/payment-settings", {
    method: "PATCH",
    body: JSON.stringify({ provider, apiKey }),
  });

// Domain
export const getDomainStatus = () => request("/api/admin/domain/status");
export const submitDomain = (domainName) =>
  request("/api/admin/domain", {
    method: "POST",
    body: JSON.stringify({ domainName }),
  });

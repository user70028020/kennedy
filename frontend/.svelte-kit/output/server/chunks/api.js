async function getGsap() {
  return null;
}
async function staggerIn(elements, options) {
  const gsap = await getGsap();
  if (!gsap || !elements.length) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? 0.3,
      stagger: options?.stagger ?? 0.05,
      ease: "power2.out"
    }
  );
}
const API_URL = "http://localhost:3000/api";
function getToken() {
  return null;
}
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || "Erro na requisição");
  }
  return response.json();
}
const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, data) => request(endpoint, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  put: (endpoint, data) => request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
  upload: async (endpoint, formData) => {
    const token = getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(error.error || "Erro no upload");
    }
    return response.json();
  }
};
export {
  api as a,
  staggerIn as s
};

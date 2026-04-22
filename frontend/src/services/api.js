const API_URL = "http://localhost:5001/api";

const parseResponse = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.msg || "Erro na requisicao");
  }

  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return parseResponse(res);
};

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return parseResponse(res);
};

export const getUserById = async (id) => {
  const res = await fetch(`${API_URL}/users/${id}`);
  return parseResponse(res);
};

export const updateUserProfile = async (id, payload) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse(res);
};

export const submitRequestReview = async (payload) => {
  const res = await fetch(`${API_URL}/requests/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse(res);
};

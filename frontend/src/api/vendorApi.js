import axios from "./axios";

export const getVendors = (page = 1, search = "") =>
  axios.get(`/vendors/?page=${page}&search=${search}`);
export const calculateScore = (id) =>
  axios.post(`/vendors/${id}/calculate_score/`);

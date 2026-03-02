import axios from "./axios";

export const loginUser = (username, password) =>
  axios.post("/token/", { username, password });

export const refreshToken = (refresh) =>
  axios.post("/token/refresh/", { refresh });

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  const login = async (username, password) => {
    const res = await axios.post("/token/", { username, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    const userRes = await axios.get("/user/");
    setUser(userRes.data);
    navigate("/dashboard");
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
    window.location.reload();  // New: Force reload to clear state
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios.get("/user/").then((res) => setUser(res.data)).catch(logout);
    }
    setAuthReady(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};
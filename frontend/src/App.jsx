// src/App.jsx (Updated your existing with new routes)
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import VendorDetails from "./pages/VendorDetails";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";
import ProcurementDashboard from "./components/procurement/ProcurementDashboard";
import POList from "./components/procurement/POList";
import PRPage from "./pages/PRPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><Layout><Vendors /></Layout></ProtectedRoute>} />
      <Route path="/vendors/:id" element={<ProtectedRoute><Layout><VendorDetails /></Layout></ProtectedRoute>} />

      <Route path="/procurement/dashboard" element={<ProtectedRoute><Layout><ProcurementDashboard /></Layout></ProtectedRoute>} />
      <Route path="/procurement/pr" element={<ProtectedRoute><Layout><PRPage /></Layout></ProtectedRoute>} />
      <Route path="/procurement/po" element={<ProtectedRoute><Layout><POList /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
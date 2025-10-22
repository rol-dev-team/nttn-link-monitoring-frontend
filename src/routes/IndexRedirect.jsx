// src/routes/IndexRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export default function IndexRedirect() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

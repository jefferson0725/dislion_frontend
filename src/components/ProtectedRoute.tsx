import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useContext(AuthContext)!;
  if (!auth?.user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

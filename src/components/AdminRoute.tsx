import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext)!;
  if (!auth?.user) return <Navigate to="/login" replace />;
  if (auth.user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</> as unknown as JSX.Element;
};

export default AdminRoute;

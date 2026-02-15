// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSession } from "next-auth/react";

const ProtectedRoute = ({ children }) => {
  const { data: session } = useSession();
  return session ? children : <Navigate to="/signin" />;
};

export default ProtectedRoute;

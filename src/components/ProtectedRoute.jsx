import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import BootScreen from "./BootScreen";

export default function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return <BootScreen />;

  if (!accessToken) return <Navigate to={"/login"} />;
  return children;
}

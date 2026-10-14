import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import BootScreen from "./BootScreen";

export default function GuestRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) return <BootScreen />;

  if (accessToken) return <Navigate to={"/"} />; // if still logged in, bounce back to feed
  return children;
}

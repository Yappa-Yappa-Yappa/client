import { Routes, Route, Navigate } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./components/layout/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MainLayout from "./components/layout/MainLayout";

// Page Imports
import Feed from "./pages/Feed";
import Search from "./pages/Search";
import Chat from "./pages/Chat";
import Friend from "./pages/Friend";
import History from "./pages/History";
import Trending from "./pages/Trending";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";
import PostDetail from "./pages/PostDetail";
import CommentThread from "./pages/CommentThread";
import NotFound from "./errors/NotFound";
import Favorite from "./pages/Favorite";
import Suggestions from "./pages/Suggestions";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Setting from "./pages/Setting";
import ProfilePosts from "./pages/profile/ProfilePosts";
import ProfileReplies from "./pages/profile/ProfileReplies";
import ProfileReposts from "./pages/profile/ProfileReposts";
import ProfileMedia from "./pages/profile/ProfileMedia";

export default function App() {
  return (
    <Routes>
      {/* Public / Guest Routes */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route redirects / to /home */}
        <Route index element={<Navigate to="/home" replace />} />

        {/* Sidebar Nav Links */}
        <Route path="home" element={<Feed feedType="for-you" />} />
        <Route path="following" element={<Feed feedType="following" />} />
        <Route path="search" element={<Search />} />
        <Route path="notification" element={<Notification />} />
        <Route path="post/:id" element={<PostDetail />} />
        <Route path="comment/:id" element={<CommentThread />} />
        <Route path="chat" element={<Chat />} />
        <Route path="friend/:username/followers" element={<Friend />} />
        <Route path="friend/:username/following" element={<Friend />} />
        <Route path="history" element={<History />} />
        <Route path="trend" element={<Trending />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="favorite" element={<Favorite />} />
        <Route path="setting" element={<Setting />} />

        {/* Profile */}
        <Route path="profile/:username" element={<Profile />}>
          <Route index element={<ProfilePosts />} />
          <Route path="replies" element={<ProfileReplies />} />
          <Route path="reposts" element={<ProfileReposts />} />
          <Route path="media" element={<ProfileMedia />} />
        </Route>
      </Route>

      {/* Fallback for unknown public and protected URLs */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

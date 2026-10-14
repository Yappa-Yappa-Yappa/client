import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AccountInformation from "./pages/setting/AccountInformation";
import SettingLayout from "./components/layout/SettingLayout";
import LegalLayout from "./components/layout/LegalLayout";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Cookies from "./pages/legal/Cookies";
import Accessibility from "./pages/legal/Accessibility";
import About from "./pages/legal/About";

export default function App() {
  return (
    <>
      <RouteTitle />
      <AppRoutes />
    </>
  );
}

function AppRoutes() {
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

        {/* Profile */}
        <Route path="profile/:username" element={<Profile />}>
          <Route index element={<ProfilePosts />} />
          <Route path="comments" element={<ProfileReplies />} />
          <Route path="reposts" element={<ProfileReposts />} />
          <Route path="media" element={<ProfileMedia />} />
        </Route>

        {/* Setting */}
        <Route path="setting" element={<SettingLayout />}>
          <Route index element={<Setting />} />
          <Route path="account-info" element={<AccountInformation />} />
        </Route>
      </Route>

      {/* Legal */}
      <Route path="en" element={<LegalLayout />}>
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="accessibility" element={<Accessibility />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Fallback for unknown public and protected URLs */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function RouteTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = `${getRouteTitle(pathname)} | Yappa`;
  }, [pathname]);

  return null;
}

function getRouteTitle(pathname) {
  const titles = {
    "/": "Home",
    "/login": "Login",
    "/register": "Register",
    "/forgot-password": "Forgot Password",
    "/reset-password": "Reset Password",
    "/home": "Home",
    "/following": "Following",
    "/search": "Search",
    "/notification": "Notifications",
    "/chat": "Chat",
    "/history": "History",
    "/trend": "Trending",
    "/suggestions": "Suggestions",
    "/favorite": "Favorites",
    "/setting": "Settings",
    "/setting/account-info": "Account Information",
    "/en/terms": "Terms of Service",
    "/en/privacy": "Privacy Policy",
    "/en/cookies": "Cookie Policy",
    "/en/accessibility": "Accessibility",
    "/en/about": "About",
  };

  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/post/")) return "Post";
  if (pathname.startsWith("/comment/")) return "Comments";
  if (pathname.startsWith("/friend/")) return "Friends";
  if (pathname.endsWith("/comments")) return "Replies";
  if (pathname.endsWith("/reposts")) return "Reposts";
  if (pathname.endsWith("/media")) return "Media";
  if (pathname.startsWith("/profile/")) return "Profile";

  return "Page Not Found";
}

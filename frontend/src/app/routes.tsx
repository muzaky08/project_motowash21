import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminChatPage from "./pages/admin/AdminChatPage";
import UserAuthPage from "./pages/user/UserAuthPage";
import UserChatPage from "./pages/user/UserChatPage";
import UserDashboard from "./pages/user/UserDashboard";
import { useAuth } from "./contexts/AuthContext";

type UserRole = "admin" | "user";

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ff7a00] border-t-transparent" />
    </div>
  );
}

function getDashboardPath(role?: UserRole) {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}

function AuthRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: UserRole;
}) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!token || !user) {
    return <Navigate to={role === "admin" ? "/admin" : "/user/auth"} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (token && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    element: <Navigate to="/user/auth" replace />,
  },
  {
    path: "/user",
    element: <Navigate to="/user/auth" replace />,
  },
  {
    path: "/admin",
    element: (
      <GuestRoute>
        <AdminLoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/admin/login",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AuthRoute role="admin">
        <AdminDashboard />
      </AuthRoute>
    ),
  },
  {
    path: "/admin/dashboard/:section",
    element: (
      <AuthRoute role="admin">
        <AdminDashboard />
      </AuthRoute>
    ),
  },
  {
    path: "/admin/chat",
    element: (
      <AuthRoute role="admin">
        <AdminChatPage />
      </AuthRoute>
    ),
  },
  {
    path: "/user/auth",
    element: (
      <GuestRoute>
        <UserAuthPage />
      </GuestRoute>
    ),
  },
  {
    path: "/user/dashboard",
    element: (
      <AuthRoute role="user">
        <UserDashboard />
      </AuthRoute>
    ),
  },
  {
    path: "/user/dashboard/:section",
    element: (
      <AuthRoute role="user">
        <UserDashboard />
      </AuthRoute>
    ),
  },
  {
    path: "/chat",
    element: <Navigate to="/user/dashboard/chat" replace />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/user/dashboard" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

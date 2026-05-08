import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserAuthPage from "./pages/user/UserAuthPage";
import UserDashboard from "./pages/user/UserDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/admin",
    Component: AdminLoginPage,
  },
  {
    path: "/admin/dashboard",
    Component: AdminDashboard,
  },
  {
    path: "/user/auth",
    Component: UserAuthPage,
  },
  {
    path: "/user/dashboard",
    Component: UserDashboard,
  },
  {
    path: "*",
    element: <div className="min-h-screen flex items-center justify-center">
      <h1>404 - Halaman tidak ditemukan</h1>
    </div>,
  },
]);

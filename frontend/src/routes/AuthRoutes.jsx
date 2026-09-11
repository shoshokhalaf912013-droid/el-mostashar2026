// src/routes/AuthRoutes.jsx
import { Route, Outlet } from "react-router-dom";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Policy from "../pages/auth/Policy.jsx";

export default function AuthRoutes() {
  return <Outlet />;
}

export const authChildren = (
  <>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="policy" element={<Policy />} />
  </>
);

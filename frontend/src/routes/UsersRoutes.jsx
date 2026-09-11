// src/routes/UsersRoutes.jsx
import { Routes, Route } from "react-router-dom";

import ManageUsers from "../pages/superadmin/Users/ManageUsers.jsx";
import SA_AddUser from "../pages/superadmin/Users/SA_AddUser.jsx";
import SA_EditUser from "../pages/superadmin/Users/SA_EditUser.jsx";

export default function UsersRoutes() {
  return (
    <Routes>
      <Route path="manage" element={<ManageUsers />} />
      <Route path="add" element={<SA_AddUser />} />
      <Route path="edit-user/:id" element={<SA_EditUser />} />
    </Routes>
  );
}

import { Routes, Route } from "react-router-dom";
import SuperAdminLayout from "../pages/superadmin/SuperAdminLayout";
import SuperAdminHome from "../pages/superadmin/SuperAdminHome";
import UnitCardPreview from "./pages/UnitCardPreview";

export default function AdminPanelSandbox() {
  return (
    <SuperAdminLayout>
      <Routes>
        <Route index element={<SuperAdminHome />} />
        <Route path="unit-preview" element={<UnitCardPreview />} />
      </Routes>
    </SuperAdminLayout>
  );
}

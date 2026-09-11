import { Outlet } from "react-router-dom";
import "../styles/controlPanel.css";
import ControlPanelHome from "../pages/ControlPanelHome";

export default function ControlPanelLayout() {
  return (
    <div className="control-panel">
      <ControlPanelHome />
      <Outlet />
    </div>
  );
}

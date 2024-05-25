import { Outlet } from "react-router-dom";
import Sidebar from "../components/Dashboard/Sidebar/Siderbar";

const DashboardLayout = () => {
  return (
    <div className="relative min-h-screen md:flex">
      {/* sidebar */}
      <Sidebar />

      {/* Outlet --> dynamic content */}
      <div className="flex-1 md:ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

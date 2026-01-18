import { Outlet } from "react-router";
import Titlebar from "./Titlebar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Titlebar />
      <Sidebar />
      <main className="mt-16 md:ml-20 md:mb-0 flex-1 px-0 pb-4 lg:px-32 xl:px-64">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

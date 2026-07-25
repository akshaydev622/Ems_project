import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom"
import Sidebar from "../components/layout/Sidebar.jsx";
import { useAuth } from "../context/authcontext.jsx";
import Loading from '../components/Loading.jsx'
import TopHeader from "../components/layout/TopHeader.jsx";


const Layout = () => {
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-liner-to-br from-slate-50 via-white to-indigo-50/30">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 pt-16 sm:p-6 sm:pt-6 lg:p-8 max-w-400 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
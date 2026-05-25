import { Link, Outlet, useLocation } from 'react-router-dom'

const AdminLeave = () => {
  const location = useLocation()
  const isTypesRoute = location.pathname === '/leave/types'
  const isAllLeavesRoute = location.pathname === '/leave' || location.pathname === '/leave/'

  const navButtonBase = 'inline-flex items-center justify-center gap-2 min-w-35 px-4 py-2 rounded-md text-sm font-medium transition duration-200'
  const activeButton = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
  const inactiveButton = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 shadow-sm'

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="page-header">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Manage all employee leave requests and leave types</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link
          to="/leave"
          className={`${navButtonBase} ${isAllLeavesRoute ? activeButton : inactiveButton}`}
        >
          All Leaves
        </Link>
        <Link
          to="/leave/types"
          className={`${navButtonBase} ${isTypesRoute ? activeButton : inactiveButton}`}
        >
          Leave Types
        </Link>
      </div>

      <Outlet />
    </div>
  )
}

export default AdminLeave
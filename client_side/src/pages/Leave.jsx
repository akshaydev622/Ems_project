import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/authcontext.jsx'
import Loading from '../components/Loading'
import UserLeave from './leave/UserLeave.jsx'

const Leave = () => {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'

  if (!user) return <Loading />
  if (!isAdmin) {
    if (location.pathname === '/leave/types') {
      return <Navigate to="/leave" replace />
    }
    return <UserLeave />
  }

  return <Outlet />
}

export default Leave
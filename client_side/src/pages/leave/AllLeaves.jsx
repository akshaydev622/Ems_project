import { useCallback, useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import LeaveHistory from '../../components/leave/leaveHistory'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const AllLeaves = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get('/leaves')
      setLeaves(res.data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.error || error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaves()
  }, [fetchLeaves])

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in">
      <div className="card overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">All Leaves</h3>
          <p className="text-sm text-slate-500 mt-1">Review leave requests and manage approvals.</p>
        </div>
        <div className="p-6">
          <LeaveHistory leaves={leaves} isAdmin onUpdate={fetchLeaves} />
        </div>
      </div>
    </div>
  )
}

export default AllLeaves

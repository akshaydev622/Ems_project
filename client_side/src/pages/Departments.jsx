import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast';
import DepartmentList from '../components/department/DepartmentList';
import Loading from '../components/Loading';
import api from '../api/axios';
import DepartmentForm from '../components/department/DepartmentForm';

const Departments = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [editDepartment, setEditDepartment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchDepartments = useCallback(async ()=>{
  try{
    const res = await api.get("/departments");
    setDepartments(res.data.departments || []);
  }catch(error){
    toast.error(error.response?.data?.error || error.message);
  }finally{
    setLoading(false);
  }
  },[]);

  useEffect(()=>{
    fetchDepartments()
  },[fetchDepartments]);

  if(loading) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col justify-between sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{"Create and manage departments"}</p>
        </div>
        <button onClick={()=>setShowCreateModal(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center" >
          <Plus size={16} /> Add Department
        </button>

      </div>
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
        ):<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">

          {/* create department model */}
          {showCreateModal && (
            <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={()=>setShowCreateModal(false)}>
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fade-in" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Add New Department</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Create a new department</p>
                  </div>
                  <button onClick={()=>setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 ">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <DepartmentForm initialData={null} onCancel={()=> setShowCreateModal(false)} onSuccess={()=>{
                    setShowCreateModal(false);
                    fetchDepartments();
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* edit department model */}

          {editDepartment && (
            <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={()=>setEditDepartment(null)} >
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-fade-in" onClick={(e)=>e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 pb-0">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Edit Department</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Update Department Details</p>
                  </div>
                  <button onClick={()=>setEditDepartment(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 ">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <DepartmentForm initialData={editDepartment} onCancel={()=> setEditDepartment(null)} onSuccess={()=>{
                    setEditDepartment(null);
                    fetchDepartments();
                  }} />
                </div>

              </div>
            </div>
          )}

        </div>}
      <div className="mt-8">
      {
        departments.length === 0 ? (
          <p className="text-center py-12 text-slate-400">No departments found. Please add a department.</p>
        ) : (
          <DepartmentList departments={departments} onDelete={fetchDepartments} onEdit = { (d)=>setEditDepartment(d) } />
        )
      }
      </div>
    </div>
  )
}

export default Departments
import {useState, useEffect} from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';


const DepartmentForm = ({initialData, onCancel, onSuccess}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const isEditMode = !!initialData;

    const handleSubmit = async (e)=>{

        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try{
            setLoading(true);
            const departmentId = initialData?._id || initialData?.id;
            const url = isEditMode ? `/departments/${departmentId}` : "/departments";
            const method = isEditMode ? "put" : "post";
            await api[method](url, formData)
            toast.success(isEditMode ? "Department updated successfully" : "Department created successfully");
            onSuccess ? onSuccess() : navigate("/departments");
        }catch(error){
            toast.error(error.response?.data?.error || error.message);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data.departments || []);
            } catch (error) {
                toast.error(error.response?.data?.error || error.message);
            } finally {
                setLoadingDepartments(false);
            }
        };

        fetchDepartments();
    }, []);

    const currentDepartmentId = initialData?._id || initialData?.id;
    const selectedParentId = initialData?.parentId?._id || initialData?.parentId || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                Department Name
                </label>
                <input type="text" name="name" placeholder="Enter department name" defaultValue={initialData?.name} readOnly={!!isEditMode} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                Parent Department (optional)
                </label>
                <select name="parentId" className="w-full" defaultValue={selectedParentId}>
                <option value="">Select parent department</option>
                {loadingDepartments ? (
                    <option disabled>Loading departments...</option>
                ) : (
                    departments
                        .filter((dept) => (dept._id || dept.id) !== currentDepartmentId)
                        .map((dept) => (
                            <option key={dept._id || dept.id} value={dept._id || dept.id}>
                                {dept.name}
                            </option>
                        ))
                )}
                </select>
            </div>
        </div>
        {isEditMode && (
            <div>
                <label className="block mb-2">Status</label>
                <select name="status" defaultValue={initialData?.status}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
            </div>
        )}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
            </label>
            <textarea name="description" placeholder="Write a brief description about this department" className="resize-none" rows={4} defaultValue={initialData?.description} />
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
            <button onClick={()=>(onCancel ?onCancel() : navigate(-1))} type="button" className="btn-secondary">
                Cancel
            </button>
            <button  disabled={loading} type="submit" className="btn-primary flex items-center">
                {loading && <Loader2 className="w-4 h-4" />}
                {isEditMode ? "Update Department" : "Create Department"}
            </button>
        </div>
    </form>
  )
}

export default DepartmentForm
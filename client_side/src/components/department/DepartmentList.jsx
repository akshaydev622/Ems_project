import React from 'react'
import {format} from 'date-fns'
import { PencilIcon, Trash2Icon } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DepartmentList = ({departments, onDelete, onEdit}) => {

    const handleDelete = async (dept)=>{
        if(!confirm("Are you sure you want to delete this department?")) 
        return;
        try{
            const departmentId = dept._id || dept.id;
            await api.delete(`/departments/${departmentId}`);
            onDelete()
        }catch(error){
            toast.error(error.response?.data?.error || error.message);
        }
    }

    return (
    <div className="card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="table-modern">
                <thead>
                    <tr>
                        <th className="">Department</th>
                        <th>Description</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept) => (
                        <tr key={dept._id || dept.id}>
                            <td>{dept.name}</td>
                            <td>{dept.description}</td>
                            <td>{dept.code}</td>
                            <td>
                                <span className={`badge ${dept.status === "ACTIVE" ? "badge-success" :  "badge-danger"}`}>
                                    {dept.status}
                                </span>
                            </td>
                            <td className="text-center">
                                <button onClick={() => onEdit(dept)} className="p-2.5 mx-1 bg-white-90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"><PencilIcon className="w-4 h-4 text-indigo-600" /></button>
                                <button onClick={() => handleDelete(dept)} className="p-2.5 mx-1 bg-white-90 backdrop-blur-sm text-slate-700 hover:text-indigo-600 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"><Trash2Icon className="w-4 h-4 text-rose-600" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default DepartmentList
import { useState, useEffect } from "react";
import { dummyAdminDashboardData, dummyEmployeeDashboardData } from "../assets/assets";
import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import api from "../api/axios";


const Dashboard = () => {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/dashboard").then((res)=>setData(res.data)).catch((error)=>toast.error(error.response?.data?.error || error?.message)).finally(()=>setLoading(false));
        setTimeout(()=>{
            setLoading(false);
        },1000);
    }, []);

    if(loading) return <Loading />
    if(!data) return <div className="text-center text-slate-500 py-12">Failed to load data</div>
    if(data.role === "ADMIN"){
        return <AdminDashboard data={data} />
    }else{
        return <EmployeeDashboard data={data} />
    }
}

export default Dashboard
import { useEffect, useState } from "react"
import { dummyProfileData } from "../assets/assets";
import Loading from "../components/Loading";
import { Lock } from "lucide-react";
import ProfileFrom from "../components/ProfileFrom";
import ChangePasswordModel from "../components/ChangePasswordModel";
import { useAuth } from "../context/authcontext.jsx";
import api from "../api/axios";
import toast from "react-hot-toast";


const Settings = () => {
  const user = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModel, setShowPasswordModel] = useState(false);

  const isAdmin = true;

  const fetchProfile = async ()=>{
    try{
        const res = await api.get("/profile");
        const profile = res.data;
        if(profile) setProfile(profile);
    }catch(error){
        toast.error(error.response?.data?.error || error.message);
        setProfile(null);
    }finally{
        setLoading(false);
    } 
  }

  useEffect(()=>{
    fetchProfile()
  },[user])

  if(loading) return <Loading />

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {profile && 
        <ProfileFrom initialData={profile} onSuccess={fetchProfile} />
      }

      {/* change password trigger */}
      <div className="card max-w-md p-6 flex items-center justify-between ">
        <div className="flex item-center gap-3">
          <div className="p-2.5 text-slate-100 rounded-lg">
            <Lock className="w-4 h-4 text-slate-600"/>
          </div>
          <div>
            <p className="font-medium text-slate-900">Password</p>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>
        <button onClick={()=>setShowPasswordModel(true)} className="btn-secondary text-sm">Change</button>
      </div>
      <ChangePasswordModel open={showPasswordModel} onClose={()=>{setShowPasswordModel(false)}} />

    </div>
  )
}

export default Settings
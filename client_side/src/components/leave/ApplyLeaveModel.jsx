import {useState} from 'react'
import { CalendarDays, FileText, Loader2, Plus, Search, Send, X } from 'lucide-react';

const ApplyLeaveModel = ({open, onClose, onSuccess}) => {
    const [loading, setLoading] = useState(false);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const handleSubmit = async (e)=>{
        e.prventDefault();
    }

    if(!open) return null;

  return (
    <div className="fixed bg-black/40 backdrop-blur-sm inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
    <div className="fidex inset-0" />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0">
        <div>
            <h2 className="text-lg font-semibold text-slate-900">Apply Leave</h2>
            <p className="text-sm text-slate-500 mt-0.5">Submit you leave request for approvel</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 ">
            <X className="w-5 h-5" />
        </button>
        </div>
        {/* form */}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 text-slate-400"/>
                    Leave Type
                </label>
                <select name="type" required >
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">CASUAL Leave</option>
                    <option value="ANNUAL">ANNUAL Leave</option>
                </select>
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CalendarDays w-4 h-4 text-slate-400 />Duration
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-xs text-slate-400 mb-1">From</span>
                        <input type="date" name="startDate" required min={minDate} />
                    </div>
                    <div>
                        <span className="block text-xs text-slate-400 mb-1">To</span>
                        <input type="date" name="endDate" required min={minDate} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                </label>
                <textarea name="reason" required rows={3} className="resize-none" placeholder="Briefly describe why you need this leave..."/>
                
            </div>
            <div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} type="button" className="btn-secondary flex-1" >
                        Cancel
                    </button>
                    <button onClick={onClose} type="button" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading} >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </form>
        
    </div>
    </div>

  )
}

export default ApplyLeaveModel
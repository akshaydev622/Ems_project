import { ArrowRightIcon, CalendarIcon, DollarSignIcon, FileTextIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = ({ data }) => {
    const emp = data.employee;
    console.log(data);

    const cards = [
        { icons: CalendarIcon, value: data.currentMonthAttendance, title:"Days Present", subtitle:"This month" },
        { icons: FileTextIcon, value: data.pandingLeaves, title:"Panding Leaves", subtitle:"Awaiting approval" },
        { icons: DollarSignIcon, value: data.latestPayslip ? `₹${data.latestPayslip.netSalary?.toLocaleString()}` : "N/A", title:"Latest Payslip", subtitle:"Most recent payout" }
    ];
  return (
    <div className="animate-fade-in">
        <div className="page-header">
            <h1 className="page-title">
                Welcome {emp.firstName}!
            </h1>
            <p>{emp?.position} - {emp?.department || "No Department"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
            {cards.map((card, index) => (
                <div key={index} className='card card-hover p-5 sm:p-6 ralative overflow-hidden group flex items-center justify-between'> 
                    <div>
                        <div className='absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-slate-500/70 group-hover:bg-indigo-500/70 '/>
                        <p className="text-sm font-medium text-slate-700">{card.title}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>    
                    <card.icons className='size-10 p-2.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors'/>
                        
                </div>
            ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/attendance" className="btn-primary text-center inline-flex items-center justify-center gap-2">
                Mark Attendance <ArrowRightIcon className='size-4'/>
            </Link>
            <Link to="/leaves" className="btn-secondary text-center">
                Apply for Leaves
            </Link>
        </div>
    </div>
  )
}

export default EmployeeDashboard
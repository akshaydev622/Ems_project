import  {ShieldIcon, UserIcon } from "lucide-react"

const LoginLeftSide = () => {

    return (
        <div className="hidden md:flex w-1/2 bg-indigo-950 relative overflow-hidden border-r border-state-200">
            <div className="absolute -top-30 -left-30 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl">
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center p-12 lg:p-20 lg:p-20 w-full h-full">
                <h1 className="text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight tracking-tight">
                    Employee <br />Management System
                </h1>
                <p className="text-slate-400 text-lg max-w-md loading-relaxed">
                    Streemless your workforce operations, track attendance, and manage your team with ease.
                </p>
            </div>
        </div>
    )
}

export default LoginLeftSide
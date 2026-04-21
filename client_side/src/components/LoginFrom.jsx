import { Link } from "react-router-dom"
import LoginLeftSide from "./LoginLeftSide"
import { ArrowLeftIcon, EyeOffIcon, EyeIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"

const LoginFrom = ({role, title, subtitle}) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
        <LoginLeftSide />
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">

        <div className="w-full max-w-md animate-fade-in">
            <Link to = "/login" className="inline-flex items-center pag-2 text-slate-400 hover:text-slate-700 text-sm mb-10 transition-colors">
                <ArrowLeftIcon size={16}/> back to portals
            </Link>
            <div className="mb-8 ">
                <h1 className="text-2xl sm:text-3xl font-medium text-zinc-800">{title}</h1>
                <p className="text-slate-500 text-sm sm:text-base mt-2">{subtitle}</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-sm rounded-xl flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"/>
                    {error}
                </div>

            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none py-2 px-3 rounded-lg"
                        placeholder="Enter your email"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none py-2 px-3 rounded-lg"
                            placeholder="Enter your password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOffIcon size={18}/> : <EyeIcon size={18}/>}
                        </button>
                    </div>

                </div>
                <button type="submit" className="w-full py-3 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center cursor-pointer" disabled={loading}>
                    {loading && <Loader2Icon size={16} className="animate-spin mr-2"/>}Sign In
                </button>
            </form>

        </div>
        </div>
    </div>
  )
}

export default LoginFrom
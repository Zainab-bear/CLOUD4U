import { useNavigate } from "react-router-dom"

export default function Layout({ children }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative">

      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30"></div>

      <div className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl p-6 z-10">
        <h1
          onClick={() => navigate("/dashboard")}
          className="text-2xl font-bold mb-8 text-purple-600 cursor-pointer"
        >
          Cloud4U
        </h1>

        <div className="space-y-3">
          <div
  onClick={() => navigate("/dashboard")}
  className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-100 cursor-pointer"
>
  <img src="/filesicon.jpg" alt="All Files" className="w-7 h-7" />
  <span>All Files</span>
</div>

<div
  onClick={() => navigate("/dashboard?filter=starred")}
  className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-100 cursor-pointer"
>
  <img src="/star-icon-32.png" alt="Starred" className="w-6 h-6" />
  <span>Starred</span>
</div>

<div
  onClick={() => navigate("/bin")}
  className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-100 cursor-pointer"
>
  <img src="/bin.png" alt="Bin" className="w-13 h-7" />
  <span>Bin</span>
</div>
        </div>
      </div>

      <div className="flex-1 p-8 z-10">
        {children}
      </div>
    </div>
  )
}

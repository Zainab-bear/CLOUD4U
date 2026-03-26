import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">

      <form
        onSubmit={handleLogin}
        className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 rounded-lg border"
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg border"
          required
        />

        <button className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition">
          Login
        </button>

        <p className="text-sm mt-3 text-center">
          No account?{" "}
          <Link to="/signup" className="text-purple-600">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
import { useNavigate, Link } from "react-router-dom"

export default function Signup() {
  const navigate = useNavigate()

  const handleSignup = (e) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">

      <form
        onSubmit={handleSignup}
        className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
          Sign Up
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

        <button className="w-full bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition">
          Create Account
        </button>

        <p className="text-sm mt-3 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-purple-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
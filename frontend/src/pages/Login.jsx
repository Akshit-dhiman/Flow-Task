import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = async (role) => {
    const credentials =
      role === "admin"
        ? { email: "admin@example.com", password: "password123" }
        : { email: "member@example.com", password: "password123" };

    setForm(credentials);
    // Auto-submit with the credentials directly
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", credentials);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate("/projects");
    } catch (err) {
      toast.error(err.response?.data?.message || "Demo login failed. Make sure seed users exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%), var(--color-bg-primary)",
      }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 animate-pulse-slow" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full opacity-8 animate-pulse-slow" style={{ background: "radial-gradient(circle, #6d28d9, transparent)", animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TaskFlow</span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Sign in to your workspace</p>
        </div>

        <div className="glass rounded-2xl p-8 card-glow">
          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo("admin")} className="btn-secondary flex-1 text-xs py-1.5 justify-center" id="demo-admin-btn">
              Demo Admin
            </button>
            <button onClick={() => fillDemo("member")} className="btn-secondary flex-1 text-xs py-1.5 justify-center" id="demo-member-btn">
              Demo Member
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>or sign in manually</span>
            <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            <div>
              <label className="label-text">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: '2.25rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium" style={{ color: "#a78bfa" }}
              onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={e => e.currentTarget.style.color = "#a78bfa"}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

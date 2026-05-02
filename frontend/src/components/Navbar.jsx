import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Zap, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/my-tasks", label: "My Tasks", icon: CheckSquare },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(10, 10, 15, 0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(42, 42, 61, 0.8)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/projects" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight gradient-text">TaskFlow</span>
          </Link>

          {/* Center nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(to) ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  background: isActive(to) ? "rgba(124, 58, 237, 0.15)" : "transparent",
                  border: isActive(to) ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid transparent",
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: "var(--color-text-muted)", border: "1px solid transparent" }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#f87171";
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

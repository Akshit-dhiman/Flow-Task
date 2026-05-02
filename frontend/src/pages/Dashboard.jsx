import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DashboardStats from "../components/DashboardStats";
import toast from "react-hot-toast";
import { ChevronLeft, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [projectId]);

  const fetchDashboard = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [dashRes, projRes] = await Promise.all([
        api.get(`/projects/${projectId}/dashboard`),
        api.get(`/projects/${projectId}`),
      ]);
      setData(dashRes.data);
      setProject(projRes.data.project);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        <div className="mb-6">
          <Link to={`/projects/${projectId}`} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            <ChevronLeft size={14} /> Back to Project
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
                Dashboard
              </h1>
              {project && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {project.name} — Project Overview
                </p>
              )}
            </div>
            <button
              id="refresh-dashboard"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="btn-secondary text-sm"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "var(--color-bg-card)" }} />
            ))}
          </div>
        ) : data ? (
          <DashboardStats data={data} />
        ) : (
          <p className="text-center" style={{ color: "var(--color-text-muted)" }}>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

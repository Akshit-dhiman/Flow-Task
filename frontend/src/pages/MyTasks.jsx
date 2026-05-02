import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import toast from "react-hot-toast";
import { CheckSquare, Filter } from "lucide-react";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const { data } = await api.get("/tasks/my");
      setTasks(data.tasks || []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

  const groupedByProject = filteredTasks.reduce((acc, task) => {
    const pId = task.projectId;
    const pName = task.project?.name || "Unknown Project";
    if (!acc[pId]) acc[pId] = { name: pName, tasks: [] };
    acc[pId].tasks.push(task);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>My Tasks</h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
            <select
              id="my-tasks-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                outline: "none",
              }}
            >
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "var(--color-bg-card)" }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
              <CheckSquare size={32} style={{ color: "var(--color-accent)" }} />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-text-primary)" }}>No tasks assigned</h3>
            <p className="text-sm max-w-xs" style={{ color: "var(--color-text-muted)" }}>
              Tasks assigned to you will appear here.
            </p>
          </div>
        ) : Object.keys(groupedByProject).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedByProject).map(([pId, { name, tasks: pTasks }]) => (
              <div key={pId}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
                  <h2 className="font-semibold text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--color-bg-card)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                    {pTasks.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isAdmin={false}
                      onUpdate={(updated) => setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))}
                      onDelete={(id) => setTasks(tasks.filter((t) => t.id !== id))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center" style={{ color: "var(--color-text-muted)" }}>No tasks match that filter.</p>
        )}
      </div>
    </div>
  );
};

export default MyTasks;

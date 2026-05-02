import { useState } from "react";
import { Calendar, User, Trash2, ChevronDown } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const statusOptions = ["TODO", "IN_PROGRESS", "DONE"];

const statusClass = (s) => {
  if (s === "TODO") return "badge-todo";
  if (s === "IN_PROGRESS") return "badge-in-progress";
  return "badge-done";
};

const priorityClass = (p) => {
  if (p === "LOW") return "badge-low";
  if (p === "MEDIUM") return "badge-medium";
  return "badge-high";
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const isOverdue = d < new Date() && true;
  return { text: d.toLocaleDateString(), isOverdue };
};

const TaskCard = ({ task, isAdmin, onUpdate, onDelete }) => {
  const [status, setStatus] = useState(task.status);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dueInfo = formatDate(task.dueDate);
  const overdue = dueInfo && status !== "DONE" && new Date(task.dueDate) < new Date();

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/tasks/${task.id}`, { status: newStatus });
      setStatus(data.task.status);
      onUpdate?.(data.task);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${task.id}`);
      onDelete?.(task.id);
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
      setDeleting(false);
    }
  };

  return (
    <div
      className="glass rounded-xl p-4 animate-fadeIn transition-all duration-200"
      style={{
        border: overdue ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--color-border)",
        background: overdue ? "rgba(239, 68, 68, 0.03)" : "var(--color-bg-card)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-sm leading-snug"
            style={{
              color: "var(--color-text-primary)",
              textDecoration: status === "DONE" ? "line-through" : "none",
              opacity: status === "DONE" ? 0.6 : 1,
            }}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
              {task.description}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 p-1.5 rounded-lg transition-all"
            style={{ color: "var(--color-text-muted)" }}
            title="Delete task"
            onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={statusClass(status)}>{status.replace("_", " ")}</span>
        <span className={priorityClass(task.priority)}>{task.priority}</span>
        {overdue && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
            OVERDUE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <User size={11} />
            <span>{task.assignedTo.name}</span>
          </div>
        )}
        {dueInfo && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: overdue ? "#f87171" : "var(--color-text-muted)" }}>
            <Calendar size={11} />
            <span>{dueInfo.text}</span>
          </div>
        )}
        {task.project && (
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ background: "rgba(124, 58, 237, 0.1)", color: "#a78bfa" }}>
            {task.project.name}
          </div>
        )}
      </div>

      {/* Status dropdown */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="w-full text-xs px-3 py-1.5 rounded-lg appearance-none pr-8 font-medium"
          style={{
            background: "var(--color-bg-primary)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
      </div>
    </div>
  );
};

export default TaskCard;

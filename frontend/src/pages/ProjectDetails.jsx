import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import toast from "react-hot-toast";
import {
  Users, Plus, Trash2, X, ChevronLeft, BarChart2,
  Filter, CheckSquare, UserPlus, Crown, User as UserIcon
} from "lucide-react";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState("MEMBER");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Forms
  const [taskForm, setTaskForm] = useState({ title: "", description: "", dueDate: "", priority: "MEDIUM", assignedToId: "" });
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = myRole === "ADMIN";

  useEffect(() => {
    fetchAll();
  }, [projectId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/members`),
      ]);
      setProject(projRes.data.project);
      setMyRole(projRes.data.role);
      setTasks(tasksRes.data.tasks || []);
      setMembers(membersRes.data.members || []);
    } catch (err) {
      console.error("Failed to load project data:", err);
      const msg = err.response?.data?.message || "Failed to load project";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...taskForm, assignedToId: taskForm.assignedToId || null };
      const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
      setTasks([data.task, ...tasks]);
      setTaskForm({ title: "", description: "", dueDate: "", priority: "MEDIUM", assignedToId: "" });
      setShowTaskModal(false);
      toast.success("Task created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, memberForm);
      setMembers([...members, data.member]);
      setMemberForm({ email: "", role: "MEMBER" });
      setShowMemberModal(false);
      toast.success("Member added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      setMembers(members.filter((m) => m.userId !== userId));
      toast.success("Member removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const filteredTasks = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
        <Navbar />
        <div className="page-container">
          <div className="h-10 w-48 rounded-lg mb-6 animate-pulse" style={{ background: "var(--color-bg-card)" }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "var(--color-bg-card)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="mb-6">
          <Link to="/projects" className="flex items-center gap-1.5 text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            <ChevronLeft size={14} /> Back to Projects
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {project?.name}
                </h1>
                <span className={isAdmin ? "badge-admin" : "badge-member"}>{myRole}</span>
              </div>
              {project?.description && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{project.description}</p>
              )}
            </div>
            <Link to={`/projects/${projectId}/dashboard`} className="btn-secondary text-sm">
              <BarChart2 size={14} /> Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
          {["tasks", "members"].map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200"
              style={{
                background: activeTab === tab ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "transparent",
                color: activeTab === tab ? "white" : "var(--color-text-muted)",
              }}
            >
              {tab === "tasks" ? <CheckSquare className="inline mr-1.5" size={13} /> : <Users className="inline mr-1.5" size={13} />}
              {tab}
            </button>
          ))}
        </div>

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: "var(--color-text-muted)" }} />
                <select
                  id="task-status-filter"
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
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              {isAdmin && (
                <button id="create-task-btn" onClick={() => setShowTaskModal(true)} className="btn-primary text-sm">
                  <Plus size={14} /> New Task
                </button>
              )}
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <CheckSquare size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--color-accent)" }} />
                <p className="font-medium" style={{ color: "var(--color-text-muted)" }}>No tasks found</p>
                {isAdmin && (
                  <button onClick={() => setShowTaskModal(true)} className="btn-primary mt-4 text-sm">
                    <Plus size={14} /> Create First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isAdmin={isAdmin}
                    onUpdate={(updated) => setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))}
                    onDelete={(id) => setTasks(tasks.filter((t) => t.id !== id))}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
              {isAdmin && (
                <button id="add-member-btn" onClick={() => setShowMemberModal(true)} className="btn-primary text-sm">
                  <UserPlus size={14} /> Add Member
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="glass rounded-xl p-4 flex items-center gap-3 animate-fadeIn"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                  >
                    {m.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                        {m.user.name}
                      </p>
                      {m.role === "ADMIN" && <Crown size={12} style={{ color: "#fbbf24", shrink: 0 }} />}
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{m.user.email}</p>
                  </div>
                  <span className={m.role === "ADMIN" ? "badge-admin" : "badge-member"}>{m.role}</span>
                  {isAdmin && m.userId !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="p-1.5 rounded-lg ml-1 transition-all"
                      style={{ color: "var(--color-text-muted)" }}
                      title="Remove member"
                      onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg card-glow animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>New Task</h2>
              <button onClick={() => setShowTaskModal(false)} style={{ color: "var(--color-text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4" id="create-task-form">
              <div>
                <label className="label-text">Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea
                  id="task-desc-input"
                  placeholder="Describe the task..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Priority</label>
                  <select
                    id="task-priority-input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Due Date</label>
                  <input
                    id="task-due-input"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Assign To</label>
                <select
                  id="task-assign-input"
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button id="task-create-submit" type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="glass rounded-2xl p-6 w-full max-w-md card-glow animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>Add Member</h2>
              <button onClick={() => setShowMemberModal(false)} style={{ color: "var(--color-text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4" id="add-member-form">
              <div>
                <label className="label-text">Email address *</label>
                <input
                  id="member-email-input"
                  type="email"
                  placeholder="member@example.com"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label-text">Role</label>
                <select
                  id="member-role-input"
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="input-field"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button id="member-add-submit" type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

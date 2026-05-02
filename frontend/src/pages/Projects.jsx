import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import toast from "react-hot-toast";
import { Plus, FolderKanban, X } from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post("/projects", form);
      setProjects([{ ...data.project, role: "ADMIN", _count: { members: 1, tasks: 0 } }, ...projects]);
      setForm({ name: "", description: "" });
      setShowModal(false);
      toast.success("Project created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
              Your Projects
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} you're a member of
            </p>
          </div>
          <button id="create-project-btn" onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={15} />
            New Project
          </button>
        </div>

        {/* Projects grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 h-48 animate-pulse" style={{ background: "var(--color-bg-card)" }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
              <FolderKanban size={32} style={{ color: "var(--color-accent)" }} />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-text-primary)" }}>No projects yet</h3>
            <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--color-text-muted)" }}>
              Create your first project to start collaborating with your team.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={15} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      {/* Create project modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="glass rounded-2xl p-6 w-full max-w-md card-glow animate-fadeIn">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg" style={{ color: "var(--color-text-muted)" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4" id="create-project-form">
              <div>
                <label className="label-text">Project Name *</label>
                <input
                  id="project-name-input"
                  type="text"
                  placeholder="e.g. Marketing Q2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea
                  id="project-desc-input"
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button id="project-create-submit" type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
                  {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

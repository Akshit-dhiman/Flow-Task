import { Link } from "react-router-dom";
import { Users, CheckSquare, BarChart2, ArrowRight, Clock } from "lucide-react";

const ProjectCard = ({ project }) => {
  const roleClass = project.role === "ADMIN" ? "badge-admin" : "badge-member";

  return (
    <div
      className="glass glass-hover rounded-xl p-5 card-glow animate-fadeIn"
      style={{ cursor: "default" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" style={{ color: "var(--color-text-primary)" }}>
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
              {project.description}
            </p>
          )}
        </div>
        <span className={roleClass + " ml-3 shrink-0"}>{project.role}</span>
      </div>

      <div className="flex items-center gap-4 mb-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <Users size={12} />
          <span>{project._count?.members ?? 0} members</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <CheckSquare size={12} />
          <span>{project._count?.tasks ?? 0} tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <Clock size={12} />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="btn-primary text-xs px-3 py-1.5 flex-1 justify-center"
        >
          <ArrowRight size={13} />
          Open Project
        </Link>
        <Link
          to={`/projects/${project.id}/dashboard`}
          className="btn-secondary text-xs px-3 py-1.5"
          title="View Dashboard"
        >
          <BarChart2 size={13} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;

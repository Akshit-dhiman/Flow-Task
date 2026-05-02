import { CheckCircle2, Clock, AlertCircle, Users, ListTodo, TrendingUp } from "lucide-react";

const StatItem = ({ label, value, icon: Icon, color, sublabel }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </p>
        <p className="text-3xl font-bold" style={{ color }}>
          {value}
        </p>
        {sublabel && <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{sublabel}</p>}
      </div>
      <div className="p-2 rounded-lg" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  </div>
);

const DashboardStats = ({ data }) => {
  if (!data) return null;
  const { totalTasks, tasksByStatus, tasksPerUser, overdueTasks } = data;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Total Tasks" value={totalTasks} icon={ListTodo} color="#a78bfa" />
        <StatItem
          label="To Do"
          value={tasksByStatus?.TODO ?? 0}
          icon={ListTodo}
          color="#818cf8"
          sublabel="Not started"
        />
        <StatItem
          label="In Progress"
          value={tasksByStatus?.IN_PROGRESS ?? 0}
          icon={TrendingUp}
          color="#fbbf24"
          sublabel="Being worked on"
        />
        <StatItem
          label="Done"
          value={tasksByStatus?.DONE ?? 0}
          icon={CheckCircle2}
          color="#34d399"
          sublabel="Completed"
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue tasks */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Overdue Tasks
            </p>
            <AlertCircle size={16} style={{ color: overdueTasks > 0 ? "#f87171" : "var(--color-text-muted)" }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: overdueTasks > 0 ? "#f87171" : "#34d399" }}>
            {overdueTasks}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            {overdueTasks === 0 ? "All on track! 🎉" : "Past due date, incomplete"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--color-text-muted)" }}>
            Completion Rate
          </p>
          <p className="text-3xl font-bold mb-3" style={{ color: "#a78bfa" }}>
            {totalTasks > 0 ? Math.round(((tasksByStatus?.DONE ?? 0) / totalTasks) * 100) : 0}%
          </p>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${totalTasks > 0 ? ((tasksByStatus?.DONE ?? 0) / totalTasks) * 100 : 0}%`,
                background: "linear-gradient(90deg, #7c3aed, #34d399)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tasks per user */}
      {tasksPerUser && tasksPerUser.length > 0 && (
        <div className="glass rounded-xl p-5 card-glow">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} style={{ color: "var(--color-accent)" }} />
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              Task Distribution
            </h3>
          </div>
          <div className="space-y-3">
            {tasksPerUser.map((u) => (
              <div key={u.userId} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
                >
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                      {u.name}
                    </span>
                    <span className="text-xs font-bold ml-2 shrink-0" style={{ color: "#a78bfa" }}>
                      {u.count} task{u.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${totalTasks > 0 ? (u.count / totalTasks) * 100 : 0}%`,
                        background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;

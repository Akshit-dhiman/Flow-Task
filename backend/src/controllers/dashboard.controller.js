const prisma = require("../config/db");

const getDashboard = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const [totalTasks, tasksByStatus, tasksPerUser, overdueCount] = await Promise.all([
      prisma.task.count({ where: { projectId } }),

      prisma.task.groupBy({
        by: ["status"],
        where: { projectId },
        _count: { status: true },
      }),

      prisma.task.groupBy({
        by: ["assignedToId"],
        where: { projectId, assignedToId: { not: null } },
        _count: { assignedToId: true },
      }),

      prisma.task.count({
        where: {
          projectId,
          dueDate: { lt: new Date() },
          status: { not: "DONE" },
        },
      }),
    ]);

    // Format tasksByStatus
    const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasksByStatus.forEach((item) => {
      statusMap[item.status] = item._count.status;
    });

    // Fetch user details for tasksPerUser
    const userIds = tasksPerUser.map((t) => t.assignedToId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const tasksPerUserFormatted = tasksPerUser.map((t) => ({
      userId: t.assignedToId,
      name: userMap[t.assignedToId]?.name || "Unknown",
      email: userMap[t.assignedToId]?.email || "",
      count: t._count.assignedToId,
    }));

    res.json({
      success: true,
      totalTasks,
      tasksByStatus: statusMap,
      tasksPerUser: tasksPerUserFormatted,
      overdueTasks: overdueCount,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };

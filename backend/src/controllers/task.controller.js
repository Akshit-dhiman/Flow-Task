const prisma = require("../config/db");
const { validateTask } = require("../utils/validators");

const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedToId } = req.body;
    const errors = validateTask({ title, priority, status, dueDate });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    // Validate assigned user is a member
    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assignedToId, projectId: req.params.projectId } },
      });
      if (!isMember) {
        return res.status(400).json({ success: false, message: "Assigned user is not a project member" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        status: status || "TODO",
        projectId: req.params.projectId,
        createdById: req.user.id,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedToId } = req.query;
    const isAdmin = req.membership.role === "ADMIN";

    const where = { projectId: req.params.projectId };
    if (!isAdmin) where.assignedToId = req.user.id;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (isAdmin && assignedToId) where.assignedToId = assignedToId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: req.user.id },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    // Check membership in the task's project
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
    });
    if (!membership) return res.status(403).json({ success: false, message: "Not a project member" });

    const isAdmin = membership.role === "ADMIN";
    const isAssigned = task.assignedToId === req.user.id;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ success: false, message: "You can only update your assigned tasks" });
    }

    const { title, description, dueDate, priority, status, assignedToId } = req.body;

    // Members can only update status
    const updateData = {};
    if (isAdmin) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (priority !== undefined) updateData.priority = priority;
      if (assignedToId !== undefined) {
        if (assignedToId) {
          const isMember = await prisma.projectMember.findUnique({
            where: { userId_projectId: { userId: assignedToId, projectId: task.projectId } },
          });
          if (!isMember) return res.status(400).json({ success: false, message: "Assigned user is not a project member" });
        }
        updateData.assignedToId = assignedToId || null;
      }
    }
    if (status !== undefined) {
      if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      updateData.status = status;
    }

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, task: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
    });

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required to delete tasks" });
    }

    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getProjectTasks, getMyTasks, updateTask, deleteTask };

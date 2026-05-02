const prisma = require("../config/db");
const { validateProject } = require("../utils/validators");

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const errors = validateProject({ name });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        members: {
          create: { userId: req.user.id, role: "ADMIN" },
        },
      },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            _count: { select: { tasks: true, members: true } },
          },
        },
      },
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      role: m.role,
    }));

    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    res.json({ success: true, project, role: req.membership.role });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (name !== undefined) {
      const errors = validateProject({ name });
      if (errors.length > 0) {
        return res.status(400).json({ success: false, message: errors.join(", ") });
      }
    }

    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { ...(name && { name }), ...(description !== undefined && { description }) },
    });

    res.json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    // Delete all related data first
    await prisma.task.deleteMany({ where: { projectId: req.params.projectId } });
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.projectId } });
    await prisma.project.delete({ where: { id: req.params.projectId } });

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const validRole = role && ["ADMIN", "MEMBER"].includes(role) ? role : "MEMBER";

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.projectId } },
    });
    if (existing) return res.status(400).json({ success: false, message: "User is already a member" });

    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId: req.params.projectId, role: validRole },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, member });
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, members });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Cannot remove yourself if you're the only admin
    const adminCount = await prisma.projectMember.count({
      where: { projectId: req.params.projectId, role: "ADMIN" },
    });

    const targetMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: req.params.projectId } },
    });

    if (!targetMember) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (targetMember.role === "ADMIN" && adminCount <= 1) {
      return res.status(400).json({ success: false, message: "Cannot remove the only admin" });
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId: req.params.projectId } },
    });

    res.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, addMember, getMembers, removeMember };

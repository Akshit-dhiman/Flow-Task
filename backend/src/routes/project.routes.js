const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const { requireMembership, requireAdmin } = require("../middleware/role.middleware");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  getMembers,
  removeMember,
} = require("../controllers/project.controller");
const { createTask, getProjectTasks } = require("../controllers/task.controller");

// Project CRUD
router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:projectId", authenticate, requireMembership, getProjectById);
router.put("/:projectId", authenticate, requireAdmin, updateProject);
router.delete("/:projectId", authenticate, requireAdmin, deleteProject);

// Member management
router.post("/:projectId/members", authenticate, requireAdmin, addMember);
router.get("/:projectId/members", authenticate, requireMembership, getMembers);
router.delete("/:projectId/members/:userId", authenticate, requireAdmin, removeMember);

// Task routes scoped to a project (accessible at /api/projects/:projectId/tasks)
router.get("/:projectId/tasks", authenticate, requireMembership, getProjectTasks);
router.post("/:projectId/tasks", authenticate, requireAdmin, createTask);

module.exports = router;

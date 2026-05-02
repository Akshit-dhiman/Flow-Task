const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const { requireMembership, requireAdmin } = require("../middleware/role.middleware");
const { createTask, getProjectTasks, getMyTasks, updateTask, deleteTask } = require("../controllers/task.controller");

// My tasks (global, no project context)
router.get("/my", authenticate, getMyTasks);

// Project-scoped tasks
router.post("/projects/:projectId/tasks", authenticate, requireAdmin, createTask);
router.get("/projects/:projectId/tasks", authenticate, requireMembership, getProjectTasks);

// Individual task operations (membership checked inside controller)
router.put("/:taskId", authenticate, updateTask);
router.delete("/:taskId", authenticate, deleteTask);

module.exports = router;

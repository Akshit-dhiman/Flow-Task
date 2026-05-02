const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const { requireMembership } = require("../middleware/role.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");

router.get("/:projectId/dashboard", authenticate, requireMembership, getDashboard);

module.exports = router;

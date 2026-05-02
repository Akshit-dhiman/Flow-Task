const prisma = require("../config/db");

const requireMembership = async (req, res, next) => {
  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: req.params.projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: req.params.projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    if (membership.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireMembership, requireAdmin };

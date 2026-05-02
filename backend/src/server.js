require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === "*") {
      return callback(null, true);
    }
    return callback(null, true); // Allow all in production for now
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Auto-seed demo users in production
  if (process.env.NODE_ENV === "production") {
    try {
      const { execSync } = require("child_process");
      execSync("node prisma/seed.js", { cwd: __dirname + "/..", stdio: "inherit" });
      console.log("✅ Seed completed");
    } catch (e) {
      console.log("⚠️ Seed skipped (may already exist):", e.message);
    }
  }
});

module.exports = app;

const validateSignup = (data) => {
  const errors = [];
  if (!data.name || data.name.trim() === "") errors.push("Name is required");
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email is required");
  if (!data.password || data.password.length < 6) errors.push("Password must be at least 6 characters");
  return errors;
};

const validateProject = (data) => {
  const errors = [];
  if (!data.name || data.name.trim() === "") errors.push("Project name is required");
  return errors;
};

const validateTask = (data) => {
  const errors = [];
  if (!data.title || data.title.trim() === "") errors.push("Task title is required");
  if (data.priority && !["LOW", "MEDIUM", "HIGH"].includes(data.priority)) {
    errors.push("Priority must be LOW, MEDIUM, or HIGH");
  }
  if (data.status && !["TODO", "IN_PROGRESS", "DONE"].includes(data.status)) {
    errors.push("Status must be TODO, IN_PROGRESS, or DONE");
  }
  if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
    errors.push("Due date must be a valid date");
  }
  return errors;
};

module.exports = { validateSignup, validateProject, validateTask };

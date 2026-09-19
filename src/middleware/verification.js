const validStatuses = ['todo', 'in-progress', 'completed'];
const validPriorities = ['low', 'medium', 'high'];

const validateTask = (req, res, next) => {
  const { title, description, status, priority, assignee } = req.body;
  const method = req.method;

  if (method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must be between 1 and 255 characters'
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Description is required and cannot be empty'
      });
    }

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    if (!assignee || typeof assignee !== 'string' || assignee.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Assignee is required and cannot be empty'
      });
    }
  }

  if (method === 'PUT') {
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (priority !== undefined && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 255)) {
      return res.status(400).json({
        success: false,
        error: 'Title must be between 1 and 255 characters'
      });
    }

    if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Description cannot be empty'
      });
    }

    if (assignee !== undefined && (typeof assignee !== 'string' || assignee.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Assignee cannot be empty'
      });
    }

    const hasUpdates = title !== undefined || description !== undefined || status !== undefined || priority !== undefined || assignee !== undefined;
    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      });
    }
  }

  next();
};

const validateId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID'
    });
  }

  req.taskId = id;
  next();
};

module.exports = { validateTask, validateId };

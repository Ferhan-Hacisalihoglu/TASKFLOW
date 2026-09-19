const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, findTaskById, updateTask, deleteTask } = require('../utils/file');
const { validateTask, validateId } = require('../middleware/verification');

router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keyword query parameter is required'
      });
    }

    const { tasks } = await getAllTasks({ keyword });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/assignee/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { tasks } = await getAllTasks({ assignee: name });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/reports/completed', async (req, res) => {
  try {
    const { tasks } = await getAllTasks({ status: 'completed' });

    res.status(200).json({
      success: true,
      report: 'completed_tasks',
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/reports/pending', async (req, res) => {
  try {
    const { tasks } = await getAllTasks({ status: 'todo' });

    res.status(200).json({
      success: true,
      report: 'pending_tasks',
      count: tasks.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/reports/summary', async (req, res) => {
  try {
    const { tasks: allTasks } = await getAllTasks();

    const summary = {
      total: allTasks.length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      byPriority: {
        high: allTasks.filter(t => t.priority === 'high').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        low: allTasks.filter(t => t.priority === 'low').length
      },
      byAssignee: allTasks.reduce((acc, t) => {
        acc[t.assignee] = (acc[t.assignee] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      report: 'system_summary',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/', validateTask, async (req, res) => {
  try {
    const { title, description, status, priority, assignee } = req.body;

    const newTask = await createTask({ title, description, status, priority, assignee });

    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, priority, assignee, keyword, sort, page, limit } = req.query;

    const { tasks, pagination } = await getAllTasks({
      status,
      priority,
      assignee,
      keyword,
      sort,
      page,
      limit
    });

    const response = {
      success: true,
      count: tasks.length,
      data: tasks
    };

    if (pagination) {
      response.pagination = pagination;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/:id', validateId, async (req, res) => {
  try {
    const task = await findTaskById(req.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.put('/:id', validateId, validateTask, async (req, res) => {
  try {
    const updatedTask = await updateTask(req.taskId, req.body);

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.delete('/:id', validateId, async (req, res) => {
  try {
    const deleted = await deleteTask(req.taskId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

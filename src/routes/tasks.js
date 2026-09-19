const express = require('express');
const router = express.Router();
const {
  searchTasks,
  getByAssignee,
  getCompletedCount,
  getPendingCount,
  getSummary,
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController
} = require('../controller/tasksController');
const { validateTask, validateId } = require('../middleware/verification');

router.get('/search', searchTasks);

router.get('/assignee/:name', getByAssignee);

router.get('/reports/completed', getCompletedCount);

router.get('/reports/pending', getPendingCount);

router.get('/reports/summary', getSummary);

router.post('/', validateTask, createTaskController);

router.get('/', getAllTasksController);

router.get('/:id', validateId, getTaskByIdController);

router.put('/:id', validateId, validateTask, updateTaskController);

router.delete('/:id', validateId, deleteTaskController);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  searchTasks,
  getByAssignee,
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController
} = require('../controller/tasksController');
const { validateTask, validateId } = require('../middleware/verification');

router.get('/search', searchTasks);

router.get('/assignee/:name', getByAssignee);

router.post('/', validateTask, createTaskController);

router.get('/', getAllTasksController);

router.get('/:id', validateId, getTaskByIdController);

router.put('/:id', validateId, validateTask, updateTaskController);

router.delete('/:id', validateId, deleteTaskController);

module.exports = router;

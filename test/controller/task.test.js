jest.mock('../../src/utils/file');

const fileUtils = require('../../src/utils/file');
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
} = require('../../src/controller/tasksController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('tasksController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchTasks', () => {
    it('should return 400 if keyword is missing', async () => {
      const req = { query: {} };
      const res = mockRes();

      await searchTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Keyword query parameter is required'
      });
    });

    it('should return 400 if keyword is empty string', async () => {
      const req = { query: { keyword: '   ' } };
      const res = mockRes();

      await searchTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return matching tasks', async () => {
      const req = { query: { keyword: 'test' } };
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1, title: 'Test task' }]
      });

      await searchTasks(req, res);

      expect(fileUtils.getAllTasks).toHaveBeenCalledWith({ keyword: 'test' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: [{ id: 1, title: 'Test task' }]
      });
    });

    it('should handle errors with 500', async () => {
      const req = { query: { keyword: 'test' } };
      const res = mockRes();
      fileUtils.getAllTasks.mockRejectedValue(new Error('DB error'));

      await searchTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getByAssignee', () => {
    it('should return tasks for assignee', async () => {
      const req = { params: { name: 'ferhan' } };
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1, assignee: 'ferhan' }]
      });

      await getByAssignee(req, res);

      expect(fileUtils.getAllTasks).toHaveBeenCalledWith({ assignee: 'ferhan' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCompletedCount', () => {
    it('should return count of completed tasks', async () => {
      const req = {};
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1 }, { id: 2 }]
      });

      await getCompletedCount(req, res);

      expect(fileUtils.getAllTasks).toHaveBeenCalledWith({ status: 'completed' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        report: 'completed_tasks',
        count: 2
      });
    });
  });

  describe('getPendingCount', () => {
    it('should return count of pending tasks', async () => {
      const req = {};
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1 }]
      });

      await getPendingCount(req, res);

      expect(fileUtils.getAllTasks).toHaveBeenCalledWith({ status: 'todo' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        report: 'pending_tasks',
        count: 1
      });
    });
  });

  describe('getSummary', () => {
    it('should return system summary', async () => {
      const req = {};
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [
          { id: 1, status: 'todo', priority: 'high', assignee: 'ferhan' },
          { id: 2, status: 'completed', priority: 'low', assignee: 'ahmet' },
          { id: 3, status: 'in-progress', priority: 'medium', assignee: 'ferhan' }
        ]
      });

      await getSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        report: 'system_summary',
        data: {
          total: 3,
          todo: 1,
          'in-progress': 1,
          completed: 1,
          byPriority: { high: 1, medium: 1, low: 1 },
          byAssignee: { ferhan: 2, ahmet: 1 }
        }
      });
    });
  });

  describe('createTaskController', () => {
    it('should create task and return 201', async () => {
      const req = {
        body: { title: 'New', description: 'Desc', status: 'todo', priority: 'high', assignee: 'ferhan' }
      };
      const res = mockRes();
      const newTask = { id: 1, ...req.body, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
      fileUtils.createTask.mockResolvedValue(newTask);

      await createTaskController(req, res);

      expect(fileUtils.createTask).toHaveBeenCalledWith({
        title: 'New',
        description: 'Desc',
        status: 'todo',
        priority: 'high',
        assignee: 'ferhan'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: newTask
      });
    });
  });

  describe('getAllTasksController', () => {
    it('should return all tasks without pagination', async () => {
      const req = { query: {} };
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1 }, { id: 2 }]
      });

      await getAllTasksController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: [{ id: 1 }, { id: 2 }]
      });
    });

    it('should include pagination if present', async () => {
      const req = { query: { page: '1', limit: '10' } };
      const res = mockRes();
      fileUtils.getAllTasks.mockResolvedValue({
        tasks: [{ id: 1 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });

      await getAllTasksController(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        })
      );
    });
  });

  describe('getTaskByIdController', () => {
    it('should return task if found', async () => {
      const req = { taskId: 1 };
      const res = mockRes();
      fileUtils.findTaskById.mockResolvedValue({ id: 1, title: 'Task' });

      await getTaskByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if not found', async () => {
      const req = { taskId: 99 };
      const res = mockRes();
      fileUtils.findTaskById.mockResolvedValue(null);

      await getTaskByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Task not found'
      });
    });
  });

  describe('updateTaskController', () => {
    it('should update and return task', async () => {
      const req = { taskId: 1, body: { title: 'Updated' } };
      const res = mockRes();
      fileUtils.updateTask.mockResolvedValue({ id: 1, title: 'Updated' });

      await updateTaskController(req, res);

      expect(fileUtils.updateTask).toHaveBeenCalledWith(1, { title: 'Updated' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if task not found', async () => {
      const req = { taskId: 99, body: { title: 'Updated' } };
      const res = mockRes();
      fileUtils.updateTask.mockResolvedValue(null);

      await updateTaskController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTaskController', () => {
    it('should delete and return success', async () => {
      const req = { taskId: 1 };
      const res = mockRes();
      fileUtils.deleteTask.mockResolvedValue(true);

      await deleteTaskController(req, res);

      expect(fileUtils.deleteTask).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task deleted successfully'
      });
    });

    it('should return 404 if task not found', async () => {
      const req = { taskId: 99 };
      const res = mockRes();
      fileUtils.deleteTask.mockResolvedValue(false);

      await deleteTaskController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

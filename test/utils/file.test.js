const fs = require('fs/promises');
const path = require('path');

jest.mock('fs/promises');

const {
  readTasks,
  writeTasks,
  findTaskById,
  getNextId,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks
} = require('../../src/utils/file');

describe('file.js utility functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readTasks', () => {
    it('should read and parse tasks from file', async () => {
      const mockTasks = [{ id: 1, title: 'Test' }];
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));

      const result = await readTasks();

      expect(result).toEqual(mockTasks);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should return empty array and write if file not found', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);
      fs.writeFile.mockResolvedValue();

      const result = await readTasks();

      expect(result).toEqual([]);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('tasks.json'),
        '[]',
        'utf-8'
      );
    });

    it('should throw error for other read failures', async () => {
      fs.readFile.mockRejectedValue(new Error('Permission denied'));

      await expect(readTasks()).rejects.toThrow('Failed to read tasks data');
    });
  });

  describe('writeTasks', () => {
    it('should write tasks to file as formatted JSON', async () => {
      const tasks = [{ id: 1, title: 'Test' }];
      fs.writeFile.mockResolvedValue();

      await writeTasks(tasks);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('tasks.json'),
        JSON.stringify(tasks, null, 2),
        'utf-8'
      );
    });
  });

  describe('findTaskById', () => {
    it('should find task by id', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));

      const result = await findTaskById(2);

      expect(result).toEqual({ id: 2, title: 'Task 2' });
    });

    it('should return null if task not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([{ id: 1 }]));

      const result = await findTaskById(99);

      expect(result).toBeNull();
    });
  });

  describe('getNextId', () => {
    it('should return 1 for empty array', async () => {
      const result = await getNextId([]);
      expect(result).toBe(1);
    });

    it('should return max id + 1', async () => {
      const result = await getNextId([{ id: 5 }, { id: 10 }, { id: 3 }]);
      expect(result).toBe(11);
    });
  });

  describe('createTask', () => {
    it('should create task with default values', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.writeFile.mockResolvedValue();

      const result = await createTask({
        title: 'New Task',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        assignee: 'ferhan'
      });

      expect(result).toMatchObject({
        id: 1,
        title: 'New Task',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        assignee: 'ferhan'
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should use default status and priority if not provided', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.writeFile.mockResolvedValue();

      const result = await createTask({
        title: 'Task',
        description: 'Desc',
        assignee: 'ahmet'
      });

      expect(result.status).toBe('todo');
      expect(result.priority).toBe('medium');
    });
  });

  describe('updateTask', () => {
    it('should update allowed fields and set updatedAt', async () => {
      const mockTasks = [{ id: 1, title: 'Old', status: 'todo', priority: 'low', assignee: 'ahmet', createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));
      fs.writeFile.mockResolvedValue();

      const result = await updateTask(1, { title: 'New', status: 'completed' });

      expect(result.title).toBe('New');
      expect(result.status).toBe('completed');
      expect(result.priority).toBe('low');
      expect(result.updatedAt).not.toBe('2026-01-01');
    });

    it('should return null if task not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      fs.writeFile.mockResolvedValue();

      const result = await updateTask(99, { title: 'New' });

      expect(result).toBeNull();
    });

    it('should ignore non-allowed fields', async () => {
      const mockTasks = [{ id: 1, title: 'Task', createdAt: '2026-01-01', updatedAt: '2026-01-01' }];
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));
      fs.writeFile.mockResolvedValue();

      const result = await updateTask(1, { hackerField: 'injected', title: 'Updated' });

      expect(result.hackerField).toBeUndefined();
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteTask', () => {
    it('should delete task and return true', async () => {
      const mockTasks = [{ id: 1 }, { id: 2 }];
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));
      fs.writeFile.mockResolvedValue();

      const result = await deleteTask(1);

      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify([{ id: 2 }], null, 2),
        'utf-8'
      );
    });

    it('should return false if task not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify([{ id: 1 }]));
      fs.writeFile.mockResolvedValue();

      const result = await deleteTask(99);

      expect(result).toBe(false);
    });
  });

  describe('getAllTasks', () => {
    const mockTasks = [
      { id: 1, title: 'Task A', status: 'todo', priority: 'high', assignee: 'ferhan' },
      { id: 2, title: 'Task B', status: 'completed', priority: 'low', assignee: 'ahmet' },
      { id: 3, title: 'Task C', status: 'in-progress', priority: 'medium', assignee: 'ferhan' }
    ];

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockTasks));
    });

    it('should return all tasks with no filters', async () => {
      const result = await getAllTasks();

      expect(result.tasks).toHaveLength(3);
      expect(result.pagination).toBeUndefined();
    });

    it('should filter by status', async () => {
      const result = await getAllTasks({ status: 'todo' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Task A');
    });

    it('should filter by priority', async () => {
      const result = await getAllTasks({ priority: 'high' });

      expect(result.tasks).toHaveLength(1);
    });

    it('should filter by assignee (case-insensitive)', async () => {
      const result = await getAllTasks({ assignee: 'FERHAN' });

      expect(result.tasks).toHaveLength(2);
    });

    it('should filter by keyword in title and description', async () => {
      const tasksWithDesc = [
        { id: 1, title: 'Frontend', description: 'React work' },
        { id: 2, title: 'Backend', description: 'API work' }
      ];
      fs.readFile.mockResolvedValue(JSON.stringify(tasksWithDesc));

      const result = await getAllTasks({ keyword: 'react' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Frontend');
    });

    it('should sort ascending by field', async () => {
      const result = await getAllTasks({ sort: 'id' });

      expect(result.tasks[0].id).toBe(1);
      expect(result.tasks[2].id).toBe(3);
    });

    it('should sort descending with - prefix', async () => {
      const result = await getAllTasks({ sort: '-id' });

      expect(result.tasks[0].id).toBe(3);
      expect(result.tasks[2].id).toBe(1);
    });

    it('should paginate results', async () => {
      const result = await getAllTasks({ page: '1', limit: '2' });

      expect(result.tasks).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2
      });
    });

    it('should return second page', async () => {
      const result = await getAllTasks({ page: '2', limit: '2' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe(3);
    });

    it('should combine filter, sort, and pagination', async () => {
      const result = await getAllTasks({
        assignee: 'ferhan',
        sort: '-id',
        page: '1',
        limit: '1'
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe(3);
      expect(result.pagination.total).toBe(2);
    });
  });
});

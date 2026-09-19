const fs = require('fs/promises');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/tasks.json');

async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeTasks([]);
      return [];
    }
    throw new Error('Failed to read tasks data');
  }
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

async function findTaskById(id) {
  const tasks = await readTasks();
  return tasks.find(task => task.id === id) || null;
}

async function getNextId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

async function createTask(taskData) {
  const tasks = await readTasks();
  const id = await getNextId(tasks);
  const now = new Date().toISOString();

  const newTask = {
    id,
    title: taskData.title,
    description: taskData.description,
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    assignee: taskData.assignee,
    createdAt: now,
    updatedAt: now
  };

  tasks.push(newTask);
  await writeTasks(tasks);
  return newTask;
}

async function updateTask(id, updates) {
  const tasks = await readTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return null;

  const allowedFields = ['title', 'description', 'status', 'priority', 'assignee'];
  const updatedTask = { ...tasks[index] };

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updatedTask[field] = updates[field];
    }
  }

  updatedTask.updatedAt = new Date().toISOString();
  tasks[index] = updatedTask;
  await writeTasks(tasks);

  return updatedTask;
}

async function deleteTask(id) {
  const tasks = await readTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return false;

  tasks.splice(index, 1);
  await writeTasks(tasks);
  return true;
}

async function getAllTasks(filters = {}) {
  let tasks = await readTasks();
  const { status, priority, assignee, keyword, sort, page, limit } = filters;

  if (status) {
    tasks = tasks.filter(task => task.status === status);
  }

  if (priority) {
    tasks = tasks.filter(task => task.priority === priority);
  }

  if (assignee) {
    tasks = tasks.filter(task => task.assignee.toLowerCase() === assignee.toLowerCase());
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    tasks = tasks.filter(task =>
      task.title.toLowerCase().includes(lowerKeyword) ||
      task.description.toLowerCase().includes(lowerKeyword)
    );
  }

  if (sort) {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;

    tasks.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }

  const total = tasks.length;

  if (page && limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    tasks = tasks.slice(offset, offset + limitNum);

    return {
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  return { tasks };
}

module.exports = {
  readTasks,
  writeTasks,
  findTaskById,
  getNextId,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks
};

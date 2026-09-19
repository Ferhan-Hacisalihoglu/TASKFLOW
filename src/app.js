const express = require('express');
const tasksRouter = require('./routes/tasks');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(logger);

app.use('/tasks', tasksRouter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TASKFLOW API is running',
    version: '1.0.0',
    endpoints: {
      tasks: '/tasks',
      search: '/tasks/search?keyword=',
      assignee: '/tasks/assignee/:name',
      reports: {
        completed: '/reports/completed',
        pending: '/reports/pending',
        summary: '/reports/summary'
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TASKFLOW API running on http://localhost:${PORT}`);
  });
}

module.exports = app;

# TASKFLOW

Task and project management REST API built with Node.js and Express.js.

TASKFLOW provides CRUD operations for tasks, request logging, validation, filtering, search, pagination, sorting, and basic task reports.

## Features

- Create, list, view, update, and delete tasks
- Assign tasks to team members
- Track task status and priority
- Logger middleware for all API requests
- Validation middleware for task input
- Filter tasks by status, priority, and assignee
- Search tasks by title or description
- Sort and paginate task results
- Completed, pending, and summary reports
- JSON file-based data storage
- Jest unit tests
- Postman request files for API testing

## Requirements

- Node.js 18 or newer
- npm

## Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/Ferhan-Hacisalihoglu/TASKFLOW.git
cd TASKFLOW
```

Install dependencies:

```bash
npm install
```

## Running the API

Start the production server:

```bash
npm start
```

The API runs at:

```text
http://localhost:3000
```

Start the development server with automatic restart:

```bash
npm run dev
```

The default port is `3000`. You can override it with the `PORT` environment variable:

```bash
PORT=4000 npm start
```

On Windows Command Prompt:

```cmd
set PORT=4000 && npm start
```

## Testing

Run the Jest test suite:

```bash
npm test
```

Run tests serially:

```bash
npm test -- --runInBand
```

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check whether the API is running |

### Task CRUD

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List tasks |
| `GET` | `/tasks/:id` | Get a task by ID |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |

### Extended Task Queries

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks/search?keyword=market` | Search by title or description |
| `GET` | `/tasks/assignee/ferhan` | List tasks assigned to a person |
| `GET` | `/tasks?status=completed` | Filter by status |
| `GET` | `/tasks?priority=high` | Filter by priority |
| `GET` | `/tasks?assignee=ferhan` | Filter by assignee |
| `GET` | `/tasks?sort=-createdAt` | Sort results; prefix with `-` for descending order |
| `GET` | `/tasks?page=1&limit=10` | Paginate results |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reports/completed` | Return the completed task count |
| `GET` | `/reports/pending` | Return the pending task count |
| `GET` | `/reports/summary` | Return a summary grouped by status, priority, and assignee |

## Create Task Example

Request:

```http
POST /tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Complete backend API",
  "description": "Finish the TASKFLOW REST API",
  "status": "todo",
  "priority": "high",
  "assignee": "ferhan"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Complete backend API",
    "description": "Finish the TASKFLOW REST API",
    "status": "todo",
    "priority": "high",
    "assignee": "ferhan",
    "createdAt": "2026-09-20T12:00:00.000Z",
    "updatedAt": "2026-09-20T12:00:00.000Z"
  }
}
```

## Task Fields

| Field | Type | Required on create | Allowed values / rules |
|---|---|---:|---|
| `id` | Integer | No | Generated automatically |
| `title` | String | Yes | 1–255 characters |
| `description` | String | Yes | Must not be empty |
| `status` | String | Yes | `todo`, `in-progress`, `completed` |
| `priority` | String | Yes | `low`, `medium`, `high` |
| `assignee` | String | Yes | Must not be empty |
| `createdAt` | ISO datetime | No | Generated automatically |
| `updatedAt` | ISO datetime | No | Updated automatically |

## Response and Error Format

Successful responses use JSON. A typical success response contains `success: true` and a `data` field.

```json
{
  "success": true,
  "data": {}
}
```

Errors use the following format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common status codes:

| Status | Meaning |
|---:|---|
| `200` | Request completed successfully |
| `201` | Resource created successfully |
| `400` | Invalid request or validation error |
| `404` | Resource or route not found |
| `500` | Unexpected server error |

## Data Storage

Tasks are stored in:

```text
data/tasks.json
```

The application uses Node.js `fs/promises` for JSON file operations. The file is seeded with sample tasks and is updated when tasks are created, modified, or deleted.

## Project Structure

```text
TASKFLOW/
├── data/
│   └── tasks.json
├── postman/
│   ├── collections/
│   │   └── Tasks/
│   ├── environments/
│   │   └── Local.environment.yaml
│   └── globals/
│       └── workspace.globals.yaml
├── src/
│   ├── app.js
│   ├── controller/
│   │   └── tasksController.js
│   ├── middleware/
│   │   ├── logger.js
│   │   └── verification.js
│   ├── routes/
│   │   └── tasks.js
│   └── utils/
│       └── file.js
├── test/
│   ├── controller/
│   │   └── task.test.js
│   └── utils/
│       └── file.test.js
├── api-design.md
├── index.md
├── package.json
└── package-lock.json
```

## Postman Testing

The project includes request definitions under:

```text
postman/collections/Tasks/
```

The requests use direct local URLs such as:

```text
http://localhost:3000/tasks
http://localhost:3000/reports/summary
```

This avoids environment-variable resolution problems in Postman. Start the API before sending requests:

```bash
npm start
```

The request files cover the health check, task CRUD operations, search, assignee filtering, and report endpoints.

## Additional Documentation

- `index.md` — requirements analysis and system design
- `api-design.md` — detailed endpoint documentation and examples
- `postman/` — Postman request and environment files

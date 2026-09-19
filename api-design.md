# TASKFLOW — API Design Document

> **Project:** Task and Project Management System API  
> **Tech Stack:** Node.js · Express.js · REST API  
> **Version:** 1.0.0  
> **Last Updated:** 2026-09-19

---

## 1. Base URL

```
http://localhost:3000
```

---

## 2. HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (new task created) |
| `400` | Bad Request | Validation error, missing/invalid fields |
| `404` | Not Found | Task with given ID not found |
| `500` | Internal Server Error | Unexpected server error |

---

## 3. Response Format

All responses are JSON.

### 3.1. Success Response (Single Task)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Market Alışverişini Yap",
    "description": "Haftalık market alışverişini tamamla",
    "status": "in-progress",
    "priority": "high",
    "assignee": "ferhan",
    "createdAt": "2026-09-19T09:00:00.000Z",
    "updatedAt": "2026-09-19T14:15:00.000Z"
  }
}
```

### 3.2. Success Response (Task List)

```json
{
  "success": true,
  "count": 4,
  "data": [
    { "id": 1, "title": "...", "status": "in-progress", ... },
    { "id": 2, "title": "...", "status": "todo", ... }
  ]
}
```

### 3.3. Error Response

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

## 4. Endpoints

---

### 4.1. Create Task

**POST** `/tasks`

Creates a new task.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ | Task title (1-255 chars) |
| `description` | String | ✅ | Task description |
| `status` | String | ✅ | `todo` / `in-progress` / `completed` |
| `priority` | String | ✅ | `low` / `medium` / `high` |
| `assignee` | String | ✅ | Assigned person |

**Example Request:**
```http
POST /tasks HTTP/1.1
Content-Type: application/json

{
  "title": "Backend API Geliştir",
  "description": "REST API endpointlerini tamamla",
  "status": "todo",
  "priority": "high",
  "assignee": "ferhan"
}
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Backend API Geliştir",
    "description": "REST API endpointlerini tamamla",
    "status": "todo",
    "priority": "high",
    "assignee": "ferhan",
    "createdAt": "2026-09-19T15:00:00.000Z",
    "updatedAt": "2026-09-19T15:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing required field | `{ "success": false, "error": "Title is required" }` |
| `400` | Invalid status value | `{ "success": false, "error": "Status must be one of: todo, in-progress, completed" }` |
| `400` | Invalid priority value | `{ "success": false, "error": "Priority must be one of: low, medium, high" }` |

---

### 4.2. List All Tasks

**GET** `/tasks`

Returns all tasks. Supports filtering, sorting, and pagination via query parameters.

**Query Parameters:**

| Parameter | Type | Required | Example | Description |
|-----------|------|----------|---------|-------------|
| `status` | String | ❌ | `?status=todo` | Filter by status |
| `priority` | String | ❌ | `?priority=high` | Filter by priority |
| `assignee` | String | ❌ | `?assignee=ferhan` | Filter by assignee |
| `sort` | String | ❌ | `?sort=createdAt` | Sort field (prefix `-` for desc) |
| `page` | Number | ❌ | `?page=1` | Page number (default: 1) |
| `limit` | Number | ❌ | `?limit=10` | Items per page (default: 10) |
| `keyword` | String | ❌ | `?keyword=backend` | Search in title/description |

**Example Requests:**
```http
GET /tasks HTTP/1.1
GET /tasks?status=in-progress&priority=high HTTP/1.1
GET /tasks?assignee=ferhan&sort=-createdAt&page=1&limit=5 HTTP/1.1
GET /tasks?keyword=api HTTP/1.1
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  },
  "data": [
    {
      "id": 1,
      "title": "Market Alışverişini Yap",
      "status": "in-progress",
      "priority": "high",
      "assignee": "ferhan"
    },
    {
      "id": 5,
      "title": "Backend API Geliştir",
      "status": "todo",
      "priority": "high",
      "assignee": "ferhan"
    }
  ]
}
```

**Notes:**
- When no query parameters are provided, all tasks are returned.
- `pagination` object is only present when `page` and `limit` are specified.

---

### 4.3. Get Task Details

**GET** `/tasks/:id`

Returns a single task by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Integer | Task ID |

**Example Request:**
```http
GET /tasks/1 HTTP/1.1
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Market Alışverişini Yap",
    "description": "Haftalık market alışverişini tamamla ve eksik ürünleri al",
    "status": "in-progress",
    "priority": "high",
    "assignee": "ferhan",
    "createdAt": "2026-09-19T09:00:00.000Z",
    "updatedAt": "2026-09-19T14:15:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid ID format | `{ "success": false, "error": "Invalid task ID" }` |
| `404` | Task not found | `{ "success": false, "error": "Task not found" }` |

---

### 4.4. Update Task

**PUT** `/tasks/:id`

Updates an existing task. All fields are optional — only provided fields are updated.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Integer | Task ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ❌ | Task title |
| `description` | String | ❌ | Task description |
| `status` | String | ❌ | `todo` / `in-progress` / `completed` |
| `priority` | String | ❌ | `low` / `medium` / `high` |
| `assignee` | String | ❌ | Assigned person |

**Example Request:**
```http
PUT /tasks/1 HTTP/1.1
Content-Type: application/json

{
  "status": "completed",
  "updatedAt": "2026-09-19T16:00:00.000Z"
}
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Market Alışverişini Yap",
    "description": "Haftalık market alışverişini tamamla ve eksik ürünleri al",
    "status": "completed",
    "priority": "high",
    "assignee": "ferhan",
    "createdAt": "2026-09-19T09:00:00.000Z",
    "updatedAt": "2026-09-19T16:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid ID format | `{ "success": false, "error": "Invalid task ID" }` |
| `400` | No fields to update | `{ "success": false, "error": "No fields provided for update" }` |
| `400` | Invalid status value | `{ "success": false, "error": "Status must be one of: todo, in-progress, completed" }` |
| `404` | Task not found | `{ "success": false, "error": "Task not found" }` |

---

### 4.5. Delete Task

**DELETE** `/tasks/:id`

Deletes a task by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Integer | Task ID |

**Example Request:**
```http
DELETE /tasks/1 HTTP/1.1
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid ID format | `{ "success": false, "error": "Invalid task ID" }` |
| `404` | Task not found | `{ "success": false, "error": "Task not found" }` |

---

### 4.6. Search Tasks

**GET** `/tasks/search?keyword=:keyword`

Searches tasks by keyword in title and description (case-insensitive).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | String | ✅ | Search term |

**Example Request:**
```http
GET /tasks/search?keyword=fatura HTTP/1.1
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 4,
      "title": "Faturaları Öde",
      "description": "Elektrik, su ve internet faturalarının ödemelerini tamamla",
      "status": "todo",
      "priority": "high",
      "assignee": "ahmet"
    }
  ]
}
```

**Error Responses:**

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing keyword | `{ "success": false, "error": "Keyword query parameter is required" }` |

---

### 4.7. List by Assignee

**GET** `/tasks/assignee/:name`

Returns all tasks assigned to a specific person.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | String | Assignee name |

**Example Request:**
```http
GET /tasks/assignee/ferhan HTTP/1.1
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "Market Alışverişini Yap",
      "assignee": "ferhan",
      "status": "in-progress"
    },
    {
      "id": 2,
      "title": "Doktor Randevusu Al",
      "assignee": "ferhan",
      "status": "todo"
    }
  ]
}
```

---

### 4.8. Reports

#### 4.8.1. Completed Task Count

**GET** `/reports/completed`

Returns the count of completed tasks.

**Example Response (200 OK):**
```json
{
  "success": true,
  "report": "completed_tasks",
  "count": 1
}
```

---

#### 4.8.2. Pending Task Count

**GET** `/reports/pending`

Returns the count of pending (todo) tasks.

**Example Response (200 OK):**
```json
{
  "success": true,
  "report": "pending_tasks",
  "count": 2
}
```

---

#### 4.8.3. System Summary

**GET** `/reports/summary`

Returns a summary of all tasks grouped by status.

**Example Response (200 OK):**
```json
{
  "success": true,
  "report": "system_summary",
  "data": {
    "total": 4,
    "todo": 2,
    "in-progress": 1,
    "completed": 1,
    "byPriority": {
      "high": 2,
      "medium": 2,
      "low": 0
    },
    "byAssignee": {
      "ferhan": 2,
      "ahmet": 2
    }
  }
}
```

---

## 5. Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, string, min 1 char, max 255 chars |
| `description` | Required, string, min 1 char |
| `status` | Required, must be one of: `todo`, `in-progress`, `completed` |
| `priority` | Required, must be one of: `low`, `medium`, `high` |
| `assignee` | Required, string, min 1 char |

---

## 6. Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Missing required field | 400 | `"Title is required"` |
| Invalid enum value | 400 | `"Status must be one of: todo, in-progress, completed"` |
| Task not found | 404 | `"Task not found"` |
| Server error | 500 | `"Internal server error"` |

---

## 7. Postman Testing Guide

### 7.1. Collection Setup

1. Create a new Postman Collection: `TASKFLOW`
2. Set base URL as variable: `{{baseUrl}} = http://localhost:3000`

### 7.2. Test Sequence

| # | Method | Endpoint | Expected Status | Description |
|---|--------|----------|-----------------|-------------|
| 1 | POST | `/tasks` | 201 | Create new task |
| 2 | GET | `/tasks` | 200 | List all tasks |
| 3 | GET | `/tasks/1` | 200 | Get task details |
| 4 | PUT | `/tasks/1` | 200 | Update task status |
| 5 | GET | `/tasks?status=completed` | 200 | Filter by status |
| 6 | GET | `/tasks/search?keyword=api` | 200 | Search tasks |
| 7 | GET | `/tasks/assignee/ferhan` | 200 | Filter by assignee |
| 8 | GET | `/reports/summary` | 200 | System summary |
| 9 | DELETE | `/tasks/5` | 200 | Delete task |

### 7.3. Sample Postman Environment

```json
{
  "baseUrl": "http://localhost:3000"
}
```

---

## 8. Data Constraints

- **ID Auto-increment:** New task IDs are generated by incrementing the highest existing ID.
- **Timestamps:** `createdAt` and `updatedAt` are automatically set to current ISO 8601 datetime.
- **Status transitions:** Any status can transition to any other status (no state machine enforcement in v1.0).

---

## Related Documents

- [[index.md]] — Requirements Analysis & System Design

# Vibe Kanban API

This document specifies how to help users manage tasks in Vibe Kanban programmatically.

## What is Vibe Kanban?

Vibe Kanban is a task management system designed for AI coding agents. It provides a kanban board interface for creating, organizing, and tracking coding tasks with automatic Git branch management and integration with popular AI coding agents.

## Prerequisites

- **Vibe Kanban must be running locally** on port `53117`
- If you receive connection errors (e.g., `ECONNREFUSED`), inform the user to open and start Vibe Kanban

## Base Configuration

- **Base URL**: `http://127.0.0.1:{PORT}`
- **Port Discovery**: Vibe Kanban uses a dynamic port. Find it by:
  1. **Terminal output**: When starting Vibe Kanban, look for: `Server running on http://127.0.0.1:{PORT}`
  2. **Process lookup**: Run `lsof -i -P | grep LISTEN | grep vibe` or `ps aux | grep vibe`
  3. **Fixed port** (recommended): Set `PORT=53117` environment variable when starting Vibe Kanban
- **Content-Type**: `application/json`
- **Response Format**: All responses follow the pattern:
  ```json
  {
    "success": boolean,
    "data": object | array | null,
    "error_data": object | null,
    "message": string | null
  }
  ```

## Port Discovery Examples

```bash
# Find the port from running Vibe Kanban process
lsof -i -P | grep LISTEN | grep vibe-kanban

# Or check for any process listening on 127.0.0.1
lsof -i -P | grep LISTEN | grep 127.0.0.1

# On Linux
netstat -tuln | grep LISTEN
```

## Workflow: Automatic Project Detection

Before creating tasks, automatically detect the `project_id`:

1. **Get current project context**: Extract the project name from:
   - Current working directory name
   - Git repository name
   - IDE workspace name
   
2. **Fetch all projects**: Call `GET /api/projects` to retrieve all Vibe Kanban projects

3. **Match project**: Compare the current project name with the `name` field in the response to find the matching `project_id`

4. **Use the project_id**: Use this ID for all subsequent task operations

If no match is found, inform the user that the current project is not configured in Vibe Kanban.

## API Endpoints

### 1. List Projects

**Method**: `GET`  
**Endpoint**: `/api/projects`

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ceb9ad4b-08de-4ed7-9408-97a2c7b812bc",
      "name": "llms-project",
      "git_repo_path": "/Users/leonardomac/Documents/llms-project",
      "setup_script": null,
      "dev_script": "yarn dev",
      "cleanup_script": null,
      "copy_files": ".env",
      "created_at": "2025-10-17T18:39:07.684Z",
      "updated_at": "2025-10-17T18:39:07.684Z"
    }
  ]
}
```

**Example**:
```bash
# Replace {PORT} with the actual port from Vibe Kanban
curl http://127.0.0.1:{PORT}/api/projects \
  -H "Content-Type: application/json"
```

**Usage**: Match the current project name or git repository path with the `name` or `git_repo_path` field to get the `project_id`.

### 2. Create Task

**Method**: `POST`  
**Endpoint**: `/api/tasks`

**Request Body**:
```json
{
  "project_id": "uuid-string",      // Required
  "title": "string",                // Required
  "description": "string",          // Optional
  "parent_task_attempt": null,      // Optional
  "image_ids": null                 // Optional
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "id": "e2a3891e-e8e6-4c29-be16-650a95d9dee5",
    "project_id": "ceb9ad4b-08de-4ed7-9408-97a2c7b812bc",
    "title": "test",
    "description": "akakaka",
    "status": "todo",
    "parent_task_attempt": null,
    "created_at": "2025-10-17T23:10:40.477Z",
    "updated_at": "2025-10-17T23:10:40.477Z"
  }
}
```

**Example**:
```bash
curl -X POST http://127.0.0.1:{PORT}/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "ceb9ad4b-08de-4ed7-9408-97a2c7b812bc",
    "title": "Implement authentication",
    "description": "Add JWT-based authentication to the API"
  }'
```

### 2. Update Task

**Method**: `PUT`  
**Endpoint**: `/api/tasks/{task_id}`

**Request Body**:
```json
{
  "title": "string",                // Optional
  "description": "string",          // Optional
  "status": "todo|in_progress|done", // Optional
  "parent_task_attempt": null,      // Optional
  "image_ids": null                 // Optional
}
```

**Example**:
```bash
curl -X PUT http://127.0.0.1:{PORT}/api/tasks/29f87507-bf75-4ee0-94fe-e1b16fc8c06a \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "status": "in_progress"
  }'
```

### 3. Delete Task

**Method**: `DELETE`  
**Endpoint**: `/api/tasks/{task_id}`

**Response**:
```json
{
  "success": true,
  "data": null
}
```

**Example**:
```bash
curl -X DELETE http://127.0.0.1:{PORT}/api/tasks/cb3ab4c2-9f8d-413d-8d89-2cd7d7481e13 \
  -H "Content-Type: application/json"
```

### 4. List Branches

**Method**: `GET`  
**Endpoint**: `/api/projects/{project_id}/branches`

**Response Example**:
```json
{
  "success": true,
  "data": [
    {
      "name": "main",
      "is_current": true,
      "is_remote": false,
      "last_commit_date": "2025-10-17T22:58:20Z"
    },
    {
      "name": "origin/main",
      "is_current": false,
      "is_remote": true,
      "last_commit_date": "2025-10-17T22:58:20Z"
    }
  ]
}
```

**Example**:
```bash
curl http://127.0.0.1:{PORT}/api/projects/ceb9ad4b-08de-4ed7-9408-97a2c7b812bc/branches \
  -H "Content-Type: application/json"
```

## Common Patterns

### Task Status Values
- `todo` - Task not started
- `in_progress` - Task currently being worked on
- `done` - Task completed

### Error Handling
- Check `success` field in response
- If `success` is `false`, check `error_data` and `message` for details
- Connection errors typically mean Vibe Kanban is not running

## Notes

- Always fetch and match the `project_id` automatically before creating tasks (see Workflow above)
- Task IDs are UUIDs returned in the response after creation
- All timestamps are in ISO 8601 format
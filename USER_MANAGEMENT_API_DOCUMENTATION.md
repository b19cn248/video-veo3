# User Management API Documentation

## Overview
This document provides detailed information about the User Management APIs in the Gemini Veo3 Management system. These APIs allow frontend applications to create new users and retrieve user information from Keycloak.

## Base URL
```
http://localhost:8080/api/users
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Create New User

### Endpoint
```
POST /api/users
```

### Description
Creates a new user in Keycloak with specified role. The user will be created with a default temporary password that must be changed on first login.

### Request Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |
| Content-Type | string | Yes | Must be `application/json` |

### Request Body
```json
{
  "username": "string",
  "fullname": "string", 
  "role": "SALE | EDITOR"
}
```

### Request Body Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username for the new user. Must not already exist in the system |
| fullname | string | Yes | Full name of the user (will be split into first name and last name) |
| role | enum | Yes | User role. Must be either `SALE` or `EDITOR` |

### Role Mapping
- `SALE`: Will be assigned `admin` role in video-veo3-be client
- `EDITOR`: Will be assigned `user` role in video-veo3-be client

### Response

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": null
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Failed to create user: <error_message>",
  "data": null
}
```

### Error Codes
| Status Code | Description |
|-------------|-------------|
| 201 | User created successfully |
| 400 | Bad request (invalid input data) |
| 409 | Conflict (username already exists) |
| 500 | Internal server error |

### Example Request
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "fullname": "John Doe",
    "role": "EDITOR"
  }'
```

### Notes
- Default password is set to `1234` and is temporary
- User must change password on first login
- Email is automatically generated as `<username>123`
- Email verification is set to false by default

---

## 2. Get All Users

### Endpoint
```
GET /api/users
```

### Description
Retrieves a list of all users with their roles from Keycloak.

### Request Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token for authentication |

### Query Parameters
None

### Response

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": [
    {
      "username": "john.doe",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "EDITOR"
    },
    {
      "username": "jane.smith",
      "email": "jane.smith@example.com", 
      "fullName": "Jane Smith",
      "role": "SALE"
    }
  ]
}
```

### Response Data Fields
| Field | Type | Description |
|-------|------|-------------|
| username | string | User's username |
| email | string | User's email address |
| fullName | string | User's full name (concatenated from first and last name) |
| role | enum | User's role (`SALE` or `EDITOR`) |

#### Error Response
```json
{
  "status": "error",
  "message": "Failed to get users: <error_message>",
  "data": null
}
```

### Error Codes
| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized (invalid or missing token) |
| 500 | Internal server error |

### Example Request
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer <jwt_token>"
```

### Notes
- Returns all users in the realm
- Role is determined by checking client-level roles in video-veo3-be client
- If user has no role or role cannot be determined, role field will be `null`

---

## Common Error Scenarios

### 1. Invalid Token
```json
{
  "status": "error",
  "message": "Unauthorized",
  "data": null
}
```

### 2. Keycloak Connection Error
```json
{
  "status": "error", 
  "message": "Failed to connect to Keycloak server",
  "data": null
}
```

### 3. Duplicate Username
```json
{
  "status": "error",
  "message": "User with username 'john.doe' already exists",
  "data": null
}
```

## Integration Notes for Frontend

### 1. Token Management
- Ensure JWT token is valid and not expired
- Implement token refresh mechanism
- Handle 401 responses by redirecting to login

### 2. Error Handling
```javascript
// Example error handling
try {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  if (data.status === 'error') {
    // Handle application error
    console.error(data.message);
  } else {
    // Process successful response
    processUsers(data.data);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

### 3. Form Validation
For create user endpoint, validate on frontend:
- Username: Required, no spaces, unique
- Fullname: Required, at least 2 words
- Role: Required, must be either 'SALE' or 'EDITOR'

### 4. User Feedback
- Show loading state during API calls
- Display success messages after user creation
- Show appropriate error messages to users
- Consider implementing retry mechanism for failed requests
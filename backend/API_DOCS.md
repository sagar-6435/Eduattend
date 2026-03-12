# EduAttend Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register Admin
**POST** `/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "institution": "ABC College"
}
```

Response:
```json
{
  "message": "Admin registered successfully",
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "name": "John Doe",
    "email": "john@example.com",
    "institution": "ABC College"
  }
}
```

### Get Current Admin
**GET** `/auth/me` (Protected)

Response:
```json
{
  "_id": "admin_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "institution": "ABC College"
}
```

---

## Student Endpoints

### Add Student
**POST** `/students/add` (Protected)

Request:
```json
{
  "name": "Alice Smith",
  "rollNumber": "CS001",
  "parentPhone": "+919876543210",
  "department": "Computer Science",
  "faceEncoding": "base64_encoded_face_image_or_encoding"
}
```

Response:
```json
{
  "message": "Student added successfully",
  "student": {
    "_id": "student_id",
    "name": "Alice Smith",
    "rollNumber": "CS001",
    "parentPhone": "+919876543210",
    "department": "Computer Science",
    "adminId": "admin_id",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Students
**GET** `/students` (Protected)

Response:
```json
[
  {
    "_id": "student_id",
    "name": "Alice Smith",
    "rollNumber": "CS001",
    "parentPhone": "+919876543210",
    "department": "Computer Science",
    "isActive": true
  }
]
```

### Get Student by ID
**GET** `/students/:id` (Protected)

Response:
```json
{
  "_id": "student_id",
  "name": "Alice Smith",
  "rollNumber": "CS001",
  "parentPhone": "+919876543210",
  "department": "Computer Science",
  "faceEncoding": "...",
  "isActive": true
}
```

### Update Student
**PUT** `/students/update/:id` (Protected)

Request:
```json
{
  "name": "Alice Johnson",
  "parentPhone": "+919876543211",
  "department": "Computer Science",
  "faceEncoding": "new_base64_encoded_face"
}
```

Response:
```json
{
  "message": "Student updated successfully",
  "student": { ... }
}
```

### Delete Student
**DELETE** `/students/delete/:id` (Protected)

Response:
```json
{
  "message": "Student deleted successfully"
}
```

---

## Attendance Endpoints

### Scan Attendance (Face Recognition)
**POST** `/attendance/scan` (Protected)

Request:
```json
{
  "classroomImage": "base64_encoded_classroom_image",
  "date": "2024-01-15"
}
```

Response:
```json
{
  "message": "Attendance marked successfully",
  "presentCount": 25,
  "absentCount": 5,
  "records": [
    {
      "_id": "attendance_id",
      "studentId": "student_id",
      "status": "Present",
      "markedBy": "FaceRecognition",
      "confidence": 0.95,
      "date": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Manual Attendance
**POST** `/attendance/manual` (Protected)

Request:
```json
{
  "studentId": "student_id",
  "date": "2024-01-15",
  "status": "Present"
}
```

Response:
```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "_id": "attendance_id",
    "studentId": "student_id",
    "status": "Present",
    "markedBy": "Manual",
    "date": "2024-01-15T00:00:00Z"
  }
}
```

### Get Attendance by Date
**GET** `/attendance/date/:date` (Protected)

Example: `/attendance/date/2024-01-15`

Response:
```json
[
  {
    "_id": "attendance_id",
    "studentId": { ... },
    "status": "Present",
    "date": "2024-01-15T00:00:00Z",
    "time": "09:30"
  }
]
```

### Get Student Attendance
**GET** `/attendance/student/:studentId` (Protected)

Response:
```json
{
  "attendance": [
    {
      "_id": "attendance_id",
      "status": "Present",
      "date": "2024-01-15T00:00:00Z"
    }
  ],
  "stats": {
    "totalDays": 30,
    "presentDays": 28,
    "absentDays": 2,
    "percentage": "93.33"
  }
}
```

### Get Monthly Report
**GET** `/attendance/report/monthly/:month/:year` (Protected)

Example: `/attendance/report/monthly/1/2024`

Response:
```json
[
  {
    "_id": "attendance_id",
    "studentId": { ... },
    "status": "Present",
    "date": "2024-01-15T00:00:00Z"
  }
]
```

---

## Notification Endpoints

### Send Absent Notifications
**POST** `/notifications/send-absent-notifications` (Protected)

Request:
```json
{
  "date": "2024-01-15"
}
```

Response:
```json
{
  "message": "Notifications sent",
  "notifications": [
    {
      "studentId": "student_id",
      "studentName": "Bob Smith",
      "parentPhone": "+919876543210",
      "status": "sent"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

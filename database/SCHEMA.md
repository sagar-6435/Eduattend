# EduAttend Database Schema

## MongoDB Collections

### 1. Admin Collection
Stores admin/teacher credentials and information.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  institution: String,
  createdAt: Date
}
```

**Indexes:**
- `email` (unique)

---

### 2. Student Collection
Stores student information and face encodings.

```javascript
{
  _id: ObjectId,
  name: String,
  rollNumber: String (unique),
  parentPhone: String,
  department: String,
  faceEncoding: String (base64 encoded face data),
  faceImageUrl: String,
  adminId: ObjectId (reference to Admin),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `rollNumber` (unique)
- `adminId`

---

### 3. Attendance Collection
Records attendance for each student.

```javascript
{
  _id: ObjectId,
  studentId: ObjectId (reference to Student),
  adminId: ObjectId (reference to Admin),
  date: Date,
  status: String (enum: ['Present', 'Absent']),
  time: String (HH:MM format),
  markedBy: String (enum: ['FaceRecognition', 'Manual']),
  confidence: Number (0-1, for face recognition),
  createdAt: Date
}
```

**Indexes:**
- `studentId, date` (compound)
- `adminId, date` (compound)

---

## Relationships

```
Admin (1) ──── (Many) Student
Admin (1) ──── (Many) Attendance
Student (1) ──── (Many) Attendance
```

---

## Sample Data

### Admin
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "$2a$10$...",
  "phone": "9876543210",
  "institution": "ABC College",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Student
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Alice Smith",
  "rollNumber": "CS001",
  "parentPhone": "+919876543210",
  "department": "Computer Science",
  "faceEncoding": "base64_encoded_face_data...",
  "adminId": "507f1f77bcf86cd799439011",
  "isActive": true,
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Attendance
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "studentId": "507f1f77bcf86cd799439012",
  "adminId": "507f1f77bcf86cd799439011",
  "date": "2024-01-15T00:00:00Z",
  "status": "Present",
  "time": "09:30",
  "markedBy": "FaceRecognition",
  "confidence": 0.95,
  "createdAt": "2024-01-15T09:30:00Z"
}
```

---

## MongoDB Setup

### Installation
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally from https://www.mongodb.com/try/download/community
```

### Connection String
```
mongodb://localhost:27017/eduattend
```

### Create Indexes
```javascript
// In MongoDB shell
use eduattend;

// Admin indexes
db.admins.createIndex({ email: 1 }, { unique: true });

// Student indexes
db.students.createIndex({ rollNumber: 1 }, { unique: true });
db.students.createIndex({ adminId: 1 });

// Attendance indexes
db.attendances.createIndex({ studentId: 1, date: 1 });
db.attendances.createIndex({ adminId: 1, date: 1 });
```

---

## Data Retention Policy

- **Attendance Records**: Keep for 2 years
- **Student Records**: Keep until student is inactive for 1 year
- **Admin Records**: Keep indefinitely
- **Soft Delete**: Use `isActive` flag instead of hard delete for students

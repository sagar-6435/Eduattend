# EduAttend Backend API

Node.js + Express.js backend for the EduAttend attendance system.

## Features

- JWT-based authentication
- Student management (CRUD operations)
- Attendance tracking (face recognition & manual)
- Attendance reports and analytics
- Parent notifications via Twilio
- MongoDB integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer
- **SMS**: Twilio

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduattend
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:5001
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
NODE_ENV=development
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

See `API_DOCS.md` for complete API documentation.

### Quick Reference

**Authentication**
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login admin
- `GET /api/auth/me` - Get current admin

**Students**
- `POST /api/students/add` - Add student
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/update/:id` - Update student
- `DELETE /api/students/delete/:id` - Delete student

**Attendance**
- `POST /api/attendance/scan` - Scan attendance (face recognition)
- `POST /api/attendance/manual` - Mark attendance manually
- `GET /api/attendance/date/:date` - Get attendance by date
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/report/monthly/:month/:year` - Monthly report

**Notifications**
- `POST /api/notifications/send-absent-notifications` - Send SMS to absent students' parents

## Database Models

### Admin
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  institution: String,
  createdAt: Date
}
```

### Student
```javascript
{
  name: String,
  rollNumber: String (unique),
  parentPhone: String,
  department: String,
  faceEncoding: String,
  adminId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance
```javascript
{
  studentId: ObjectId,
  adminId: ObjectId,
  date: Date,
  status: String ('Present' | 'Absent'),
  time: String,
  markedBy: String ('FaceRecognition' | 'Manual'),
  confidence: Number,
  createdAt: Date
}
```

## Error Handling

All errors return JSON with status code and message:

```json
{
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Authentication

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

Token is valid for 7 days by default.

## Middleware

- **auth.js** - JWT verification middleware for protected routes

## File Structure

```
backend/
├── models/
│   ├── Admin.js
│   ├── Student.js
│   └── Attendance.js
├── routes/
│   ├── auth.js
│   ├── students.js
│   ├── attendance.js
│   └── notifications.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env
```

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Deployment

### Heroku
```bash
heroku create eduattend-api
git push heroku main
```

### Environment Variables
Set all `.env` variables in Heroku config:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
```

## Performance Optimization

- Database indexes on frequently queried fields
- JWT token caching
- Attendance query optimization with date ranges
- Soft delete for students (isActive flag)

## Security

- Password hashing with bcryptjs
- JWT token expiration
- Input validation with express-validator
- CORS enabled for frontend domains
- Environment variables for sensitive data

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT

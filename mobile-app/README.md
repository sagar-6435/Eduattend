# EduAttend Mobile App

React Native (Expo) mobile application for the EduAttend attendance system.

## Features

- Admin login and authentication
- Student management (add, edit, delete)
- Face recognition-based attendance scanning
- Manual attendance marking
- Attendance records and reports
- Student profile management
- Parent notifications

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **Camera**: Expo Camera
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Date Picker**: react-native-date-picker

## Installation

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### Setup

```bash
cd mobile-app
npm install
```

## Configuration

Edit `src/api/client.js` and update the API base URL:

```javascript
const API_BASE_URL = 'http://YOUR_MACHINE_IP:5000/api';
```

Replace `YOUR_MACHINE_IP` with your machine's IP address (e.g., 192.168.1.100).

## Running

### Development
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

### Building

**Android APK:**
```bash
eas build --platform android
```

**iOS IPA:**
```bash
eas build --platform ios
```

## App Screens

### 1. Splash Screen
- Loading screen shown on app startup
- Checks for existing authentication token

### 2. Login Screen
- Admin login with email and password
- Registration option for new admins
- Form validation

### 3. Admin Dashboard
- Main menu with quick access to all features
- Displays admin name and institution
- Navigation to all app features

### 4. Add Student Screen
- Form to add new student
- Camera integration to capture face photo
- Face encoding extraction via AI service
- Input validation

### 5. Manage Students Screen
- List of all students
- Search functionality
- Edit and delete options
- Pull-to-refresh

### 6. Student Profile Screen
- View and edit student details
- Roll number is read-only
- Update name, phone, department
- Cannot change face photo from here

### 7. Attendance Camera Screen
- Date picker for attendance date
- Camera view for classroom scanning
- Face detection and recognition
- Automatic attendance marking
- Shows present/absent count

### 8. Manual Attendance Screen
- List of all students
- Toggle attendance status (Present/Absent)
- Search by name or roll number
- Bulk save attendance

### 9. Attendance Records Screen
- View attendance for specific date
- Statistics (present, absent, total)
- Date picker to change date
- Status badges

### 10. Reports Screen
- Student-wise attendance report
- Attendance statistics (total, present, absent, percentage)
- Attendance history with dates
- Student selector dropdown

## API Integration

All API calls go through `src/api/client.js` which:
- Adds JWT token to all requests
- Handles authentication errors
- Manages base URL configuration

### Example API Call
```javascript
import client from '../api/client';

const response = await client.get('/students');
```

## Authentication Flow

1. User enters credentials on Login screen
2. API returns JWT token
3. Token stored in AsyncStorage
4. Token added to all subsequent requests
5. On logout, token is removed

## Camera Permissions

The app requires camera permissions:
- iOS: Add to Info.plist
- Android: Add to AndroidManifest.xml
- Expo handles this automatically

## File Structure

```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── LoginScreen.js
│   │   ├── AdminDashboard.js
│   │   ├── AddStudentScreen.js
│   │   ├── ManageStudentsScreen.js
│   │   ├── StudentProfileScreen.js
│   │   ├── AttendanceCameraScreen.js
│   │   ├── ManualAttendanceScreen.js
│   │   ├── AttendanceRecordsScreen.js
│   │   └── ReportsScreen.js
│   └── api/
│       └── client.js
├── App.js
├── app.json
└── package.json
```

## Styling

- Uses React Native StyleSheet for performance
- Consistent color scheme (blue primary, green success, red danger)
- Responsive design for different screen sizes
- Touch-friendly UI elements

## Performance Optimization

- Lazy loading of screens
- Efficient list rendering with FlatList
- Image compression before upload
- Minimal re-renders with proper state management

## Error Handling

- Try-catch blocks for API calls
- User-friendly error messages
- Network error handling
- Validation before API calls

## Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Register new admin account
- [ ] Add student with face photo
- [ ] Edit student details
- [ ] Delete student
- [ ] Scan attendance with camera
- [ ] Mark manual attendance
- [ ] View attendance records
- [ ] View reports
- [ ] Logout

## Troubleshooting

### App won't connect to backend
- Verify backend is running on port 5000
- Check API_BASE_URL uses correct IP (not localhost)
- Ensure device is on same network as backend

### Camera not working
- Grant camera permissions
- Check device has camera
- Restart app

### Face recognition failing
- Ensure good lighting
- Face should be clearly visible
- Try different angle

### AsyncStorage errors
- Clear app cache
- Reinstall app
- Check device storage

## Deployment

### Android
```bash
eas build --platform android --release
```

### iOS
```bash
eas build --platform ios --release
```

## Contributing

1. Create feature branch
2. Make changes
3. Test on device
4. Submit pull request

## License

MIT

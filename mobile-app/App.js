import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import AddStudentScreen from './src/screens/AddStudentScreen';
import ManageStudentsScreen from './src/screens/ManageStudentsScreen';
import StudentProfileScreen from './src/screens/StudentProfileScreen';
import AttendanceCameraScreen from './src/screens/AttendanceCameraScreen';
import ManualAttendanceScreen from './src/screens/ManualAttendanceScreen';
import AttendanceRecordsScreen from './src/screens/AttendanceRecordsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {userToken == null ? (
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen
                name="Dashboard"
                component={AdminDashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddStudent"
                component={AddStudentScreen}
                options={{ title: 'Add Student' }}
              />
              <Stack.Screen
                name="ManageStudents"
                component={ManageStudentsScreen}
                options={{ title: 'Manage Students' }}
              />
              <Stack.Screen
                name="StudentProfile"
                component={StudentProfileScreen}
                options={{ title: 'Student Profile' }}
              />
              <Stack.Screen
                name="AttendanceCamera"
                component={AttendanceCameraScreen}
                options={{ title: 'Scan Attendance' }}
              />
              <Stack.Screen
                name="ManualAttendance"
                component={ManualAttendanceScreen}
                options={{ title: 'Manual Attendance' }}
              />
              <Stack.Screen
                name="AttendanceRecords"
                component={AttendanceRecordsScreen}
                options={{ title: 'Attendance Records' }}
              />
              <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{ title: 'Reports' }}
              />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import DatePicker from 'react-native-date-picker';
import client from '../api/client';

export default function AttendanceCameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  const handleCameraPermission = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }
    }
    setShowDatePicker(true);
  };

  const handleDateSelected = () => {
    setShowDatePicker(false);
    setShowCamera(true);
  };

  const scanAttendance = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });

        const classroomImage = `data:image/jpeg;base64,${photo.base64}`;

        // Send to backend for face recognition
        const response = await client.post('/attendance/scan', {
          classroomImage,
          date: selectedDate.toISOString().split('T')[0],
        });

        Alert.alert(
          'Attendance Marked',
          `Present: ${response.data.presentCount}\nAbsent: ${response.data.absentCount}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCamera(false);
                navigation.goBack();
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to scan attendance');
      } finally {
        setLoading(false);
      }
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          <View style={styles.cameraHeader}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString()}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cameraControls}>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                Position camera to capture entire classroom
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.scanButton, loading && styles.buttonDisabled]}
              onPress={scanAttendance}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Text style={styles.scanButtonText}>📷</Text>
                  <Text style={styles.scanButtonLabel}>Scan Attendance</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  if (showDatePicker) {
    return (
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerContent}>
          <Text style={styles.datePickerTitle}>Select Attendance Date</Text>
          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            mode="date"
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleDateSelected}
          >
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Start Attendance Scanning</Text>
        <Text style={styles.description}>
          Position your camera to capture the entire classroom. The system will detect student faces and mark attendance automatically.
        </Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleCameraPermission}
        >
          <Text style={styles.startButtonText}>📷 Start Scanning</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  cameraControls: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    fontSize: 32,
    marginBottom: 8,
  },
  scanButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import client from '../api/client';

export default function ManualAttendanceScreen() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await client.get('/students');
      setStudents(response.data);
      
      // Initialize attendance object
      const attendanceObj = {};
      response.data.forEach(student => {
        attendanceObj[student._id] = 'Present';
      });
      setAttendance(attendanceObj);
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(attendance).map(([studentId, status]) =>
        client.post('/attendance/manual', {
          studentId,
          date: selectedDate.toISOString().split('T')[0],
          status,
        })
      );

      await Promise.all(promises);
      Alert.alert('Success', 'Attendance saved successfully');
      setSearchText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  const StudentRow = ({ student }) => (
    <TouchableOpacity
      style={[
        styles.studentRow,
        attendance[student._id] === 'Absent' && styles.absentRow,
      ]}
      onPress={() => toggleAttendance(student._id)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentRoll}>{student.rollNumber}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          attendance[student._id] === 'Present'
            ? styles.presentBadge
            : styles.absentBadge,
        ]}
      >
        <Text style={styles.statusText}>{attendance[student._id]}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            📅 {selectedDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerContent}>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              mode="date"
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or roll number..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <StudentRow student={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.buttonDisabled]}
        onPress={handleSaveAttendance}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Attendance</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginTop: 12,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
  },
  studentRow: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  absentRow: {
    borderLeftColor: '#ef4444',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  studentRoll: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presentBadge: {
    backgroundColor: '#d1fae5',
  },
  absentBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 12,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Picker,
} from 'react-native';
import client from '../api/client';

export default function ReportsScreen() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await client.get('/students');
      setStudents(response.data);
      if (response.data.length > 0) {
        loadStudentAttendance(response.data[0]._id);
        setSelectedStudent(response.data[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAttendance = async (studentId) => {
    setLoading(true);
    try {
      const response = await client.get(`/attendance/student/${studentId}`);
      setAttendance(response.data.attendance);
      setStats(response.data.stats);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    loadStudentAttendance(studentId);
  };

  const AttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <Text style={styles.dateText}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
      <View
        style={[
          styles.statusBadge,
          item.status === 'Present'
            ? styles.presentBadge
            : styles.absentBadge,
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const selectedStudentData = students.find(s => s._id === selectedStudent);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Report</Text>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Student:</Text>
        <Picker
          selectedValue={selectedStudent}
          onValueChange={handleStudentChange}
          style={styles.picker}
        >
          {students.map(student => (
            <Picker.Item
              key={student._id}
              label={`${student.name} (${student.rollNumber})`}
              value={student._id}
            />
          ))}
        </Picker>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.presentColor]}>
              {stats.presentDays}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.absentColor]}>
              {stats.absentDays}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.percentageColor]}>
              {stats.percentage}%
            </Text>
            <Text style={styles.statLabel}>Percentage</Text>
          </View>
        </View>
      )}

      <View style={styles.attendanceListContainer}>
        <Text style={styles.listTitle}>Attendance History</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <FlatList
            data={attendance}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <AttendanceItem item={item} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No attendance records</Text>
              </View>
            }
          />
        )}
      </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  picker: {
    height: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  statCardInner: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  presentColor: {
    color: '#10b981',
  },
  absentColor: {
    color: '#ef4444',
  },
  percentageColor: {
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  attendanceListContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  attendanceItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
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
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import client from '../api/client';

export default function StudentProfileScreen({ route, navigation }) {
  const { studentId } = route.params;
  const [student, setStudent] = useState(null);
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const response = await client.get(`/students/${studentId}`);
      setStudent(response.data);
      setName(response.data.name);
      setParentPhone(response.data.parentPhone);
      setDepartment(response.data.department);
    } catch (error) {
      Alert.alert('Error', 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name || !parentPhone || !department) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setUpdating(true);
    try {
      await client.put(`/students/update/${studentId}`, {
        name,
        parentPhone,
        department,
      });
      Alert.alert('Success', 'Student updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update student');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Roll Number (Cannot be changed)</Text>
          <Text style={styles.readOnlyValue}>{student?.rollNumber}</Text>
        </View>

        <Text style={styles.label}>Student Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          editable={!updating}
        />

        <Text style={styles.label}>Parent Phone Number</Text>
        <TextInput
          style={styles.input}
          value={parentPhone}
          onChangeText={setParentPhone}
          keyboardType="phone-pad"
          editable={!updating}
        />

        <Text style={styles.label}>Department / Class</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          editable={!updating}
        />

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateText}>Update Student</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  form: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

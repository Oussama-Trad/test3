import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../../context/UserContext';

const types = [
  { label: 'Annuel', value: 'annuel' },
  { label: 'Maladie', value: 'maladie' },
  { label: 'Exceptionnel', value: 'exceptionnel' },
];

const LeaveRequestForm = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [type, setType] = useState('annuel');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!type || !startDate || !endDate) return Alert.alert('Erreur', 'Tous les champs sont obligatoires');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.id,
          locationId: user.locationId,
          departementId: user.departementId,
          type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      });
      if (res.ok) {
        Alert.alert('Succès', 'Demande envoyée');
        navigation.goBack();
      } else {
        Alert.alert('Erreur', 'Erreur lors de l\'envoi');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Erreur réseau');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de congé</Text>
      <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
        {types.map(t => <Picker.Item key={t.value} label={t.label} value={t.value} />)}
      </Picker>
      <Text style={styles.label}>Date début</Text>
      <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateBtn}>
        <Text>{startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => { setShowStart(false); if (d) setStartDate(d); }}
        />
      )}
      <Text style={styles.label}>Date fin</Text>
      <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateBtn}>
        <Text>{endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => { setShowEnd(false); if (d) setEndDate(d); }}
        />
      )}
      <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'Envoi...' : 'Envoyer la demande'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f6f8fa' },
  label: { fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  picker: { backgroundColor: '#fff', borderRadius: 8 },
  dateBtn: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  submitBtn: { backgroundColor: '#007bff', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
});

export default LeaveRequestForm;

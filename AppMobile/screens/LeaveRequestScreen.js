import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../context/UserContext';

const LeaveRequestScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [type, setType] = useState('annuel');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.id,
          employeeNom: user.nom,
          employeePrenom: user.prenom,
          locationId: user.locationId,
          locationNom: user.locationNom,
          departementId: user.departementId,
          departementNom: user.departementNom,
          type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      });
      if (res.ok) {
        Alert.alert('Succès', 'Demande envoyée !');
        navigation.goBack();
      } else {
        const err = await res.json();
        Alert.alert('Erreur', err.error || 'Erreur lors de la demande');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Type de congé</Text>
      <TextInput style={styles.input} value={type} onChangeText={setType} placeholder="Type (ex: annuel)" />
      <Text style={styles.label}>Date de début</Text>
      <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateBtn}>
        <Text>{startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker value={startDate} mode="date" display="default" onChange={(e, d) => { setShowStart(false); if (d) setStartDate(d); }} />
      )}
      <Text style={styles.label}>Date de fin</Text>
      <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateBtn}>
        <Text>{endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker value={endDate} mode="date" display="default" onChange={(e, d) => { setShowEnd(false); if (d) setEndDate(d); }} />
      )}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'Envoi...' : 'Envoyer'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fa' },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 8 },
  dateBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: '#fff' },
  submitBtn: { backgroundColor: '#007bff', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 32 },
});

export default LeaveRequestScreen;

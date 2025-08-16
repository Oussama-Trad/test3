import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../../context/UserContext';

const LeaveRequestForm = ({ navigation }) => {
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
        }),
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F5F7FA', '#E9EDF0']} style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Demande de congé</Text>
          <Text style={styles.label}>Type de congé</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="Type (ex: annuel)"
            placeholderTextColor="#888"
          />
          <Text style={styles.label}>Date de début</Text>
          <TouchableOpacity onPress={() => setShowStart(true)} style={styles.dateBtn}>
            <Text style={styles.dateText}>{startDate.toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</Text>
          </TouchableOpacity>
          {showStart && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowStart(false);
                if (d) setStartDate(d);
              }}
            />
          )}
          <Text style={styles.label}>Date de fin</Text>
          <TouchableOpacity onPress={() => setShowEnd(true)} style={styles.dateBtn}>
            <Text style={styles.dateText}>{endDate.toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</Text>
          </TouchableOpacity>
          {showEnd && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowEnd(false);
                if (d) setEndDate(d);
              }}
            />
          )}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.submitBtnText}>{loading ? 'Envoi...' : 'Envoyer'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D2D51',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFD',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    color: '#1D2D51',
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFD',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  submitBtn: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#A3BFFA',
    shadowOpacity: 0.1,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default LeaveRequestForm;
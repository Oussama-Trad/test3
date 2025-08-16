import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';

const MyLeavesScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [leaves, setLeaves] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests?employeeId=${user.id}`);
      const data = await res.json();
      setLeaves(data);
    } catch (e) {
      setLeaves([]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes de congé</Text>
      <FlatList
        data={leaves}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.type}>{item.type} ({new Date(item.startDate).toLocaleDateString()} → {new Date(item.endDate).toLocaleDateString()})</Text>
            <Text style={styles.status}>Statut : {item.status}</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLeaves} />}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Aucune demande</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LeaveRequest')}>
        <Text style={styles.fabText}>+ Demander un congé</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f5f7fa' },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 16 },
  item: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  type: { fontWeight: 'bold', marginBottom: 4 },
  status: { color: '#007bff' },
  fab: { position: 'absolute', right: 24, bottom: 32, backgroundColor: '#007bff', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 22, elevation: 4 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MyLeavesScreen;
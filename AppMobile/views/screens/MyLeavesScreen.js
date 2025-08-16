import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { UserContext } from '../../context/UserContext';

const MyLeavesScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leave-requests?employeeId=${user.id}`);
      const data = await res.json();
      setLeaves(data);
    } catch (e) {
      setLeaves([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.type}>{item.type}</Text>
      <Text>Période : {new Date(item.startDate).toLocaleDateString()} → {new Date(item.endDate).toLocaleDateString()}</Text>
      <Text>Statut : <Text style={{fontWeight:'bold'}}>{item.status}</Text></Text>
      <Text style={styles.date}>Créée le {new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>Mes demandes de congé</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('LeaveRequestForm')}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Nouvelle demande</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListEmptyComponent={<Text style={{textAlign:'center',marginTop:32}}>Aucune demande</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  type: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  date: { color: '#888', fontSize: 12, marginTop: 6 },

  newBtn: { backgroundColor: '#1D2D51', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
});

export default MyLeavesScreen;

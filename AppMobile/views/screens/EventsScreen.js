import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';

const API_URL = 'http://localhost:5000/api/events';

const EventsScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext); // user.locationId, user.departementId
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
  const url = `${API_URL}?locationId=${user.locationId}&departementId=${user.departementId}`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Erreur API');
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#1D2D51" style={{ flex: 1, justifyContent: 'center' }} />;
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', marginBottom: 10 }}>Erreur : {error}</Text>
  <Text>locationId: {user?.locationId || 'null'}</Text>
  <Text>departementId: {user?.departementId || 'null'}</Text>
        <Text style={{ marginTop: 10, color: '#1D2D51', fontSize: 12 }}>user: {JSON.stringify(user)}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.photo && (
        <Image source={{ uri: item.photo }} style={styles.image} />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{formatDate(item.startDate)} - {formatDate(item.endDate)}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      >
        <Text style={styles.buttonText}>Voir plus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={{ color: '#1D2D51', marginBottom: 8, textAlign: 'center' }}>
        locationId: {user?.locationId || 'null'} | departementId: {user?.departementId || 'null'}
      </Text>
      <Text style={{ color: '#1D2D51', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>user: {JSON.stringify(user)}</Text>
      {events.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Aucun événement à afficher.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#1D2D51',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D2D51',
    marginBottom: 6,
  },
  date: {
    color: '#1D2D51',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1D2D51',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EventsScreen;

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const EventDetailScreen = ({ route }) => {
  const { event } = route.params;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {event.photo && (
        <Image source={{ uri: event.photo }} style={styles.image} />
      )}
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{formatDate(event.startDate)} - {formatDate(event.endDate)}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Lieu :</Text>
        <Text style={styles.value}>{event.locationId}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Département :</Text>
        <Text style={styles.value}>{event.departementId}</Text>
      </View>
    </ScrollView>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D2D51',
    marginBottom: 8,
  },
  date: {
    color: '#1D2D51',
    marginBottom: 12,
  },
  desc: {
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
  },
  infoBlock: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#1D2D51',
    marginRight: 6,
  },
  value: {
    color: '#1D2D51',
  },
});

export default EventDetailScreen;

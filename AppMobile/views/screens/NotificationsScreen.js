import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotifications } from '../../context/NotificationsContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markAllSeen } = useNotifications();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.meta?.route) {
          navigation.navigate(item.meta.route, item.meta.params || {});
        }
      }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={styles.body}>{item.body}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#666' }}>Aucune notification</Text>}
      />
      <TouchableOpacity style={styles.clearBtn} onPress={markAllSeen}>
        <Text style={styles.clearText}>Marquer tout comme lu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fb' },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '600', color: '#1D2D51' },
  time: { fontSize: 12, color: '#999' },
  body: { fontSize: 14, color: '#333' },
  clearBtn: {
    backgroundColor: '#1D2D51',
    padding: 12,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearText: { color: '#fff', fontWeight: '600' },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getAllPartenariats } from '../../services/api/partenariatApi';

const PartenariatsScreen = () => {
  const [partenariats, setPartenariats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPartenariats()
      .then(data => setPartenariats(data))
      .catch(() => setPartenariats([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partenariats</Text>
      <FlatList
        data={partenariats}
        keyExtractor={item => item.id || item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <View style={styles.info}>
              <Text style={styles.titre}>{item.titre}</Text>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>Aucun partenariat trouvé.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 12, padding: 12, alignItems: 'center', elevation: 2 },
  image: { width: 80, height: 60, borderRadius: 6, marginRight: 12, backgroundColor: '#eee' },
  info: { flex: 1 },
  titre: { fontSize: 18, fontWeight: 'bold' },
  type: { fontSize: 14, color: '#007bff', marginBottom: 4 },
  description: { fontSize: 14, color: '#333' },
});

export default PartenariatsScreen;

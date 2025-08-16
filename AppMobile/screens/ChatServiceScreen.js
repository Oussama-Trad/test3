import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const ChatServiceScreen = ({ navigation }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [departementFilter, setDepartementFilter] = useState('');
  const [locations, setLocations] = useState([]);
  const [departements, setDepartements] = useState([]);


  useEffect(() => {
    fetchAdmins();
  }, [locationFilter, departementFilter]);

  useEffect(() => {
    fetchLocations();
    fetchDepartements();
  }, []);
  const fetchLocations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/locations-full');
      const data = await res.json();
      setLocations(data);
    } catch (e) {
      setLocations([]);
    }
  };

  const fetchDepartements = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/departments-full');
      const data = await res.json();
      setDepartements(data);
    } catch (e) {
      setDepartements([]);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    let url = 'http://localhost:5000/api/admins';
    const params = [];
    if (locationFilter) params.push(`locationId=${locationFilter}`);
    if (departementFilter) params.push(`departementId=${departementFilter}`);
    if (params.length > 0) url += '?' + params.join('&');
    try {
      const res = await fetch(url);
      const data = await res.json();
      setAdmins(data);
    } catch (e) {
      setAdmins([]);
    }
    setLoading(false);
  };

  const filteredAdmins = admins.filter(a => {
    const fullName = `${a.nom || ''} ${a.prenom || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });


  const getLocationName = (locationId) => {
    console.log('getLocationName called with locationId:', locationId);
    console.log('locations array:', locations);
    const loc = locations.find(l => l._id === locationId);
    console.log('Found location:', loc);
    return loc ? loc.nom : locationId;
  };

  const getDepartementName = (departementId) => {
    console.log('getDepartementName called with departementId:', departementId);
    console.log('departements array:', departements);
    const dep = departements.find(d => d._id === departementId);
    console.log('Found departement:', dep);
    return dep ? dep.nom : departementId;
  };

  const renderItem = ({ item }) => {
    console.log('renderItem called with item:', item);
    return (
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatConversation', { admin: item })}>
        <Text style={styles.name}>{item.nom} {item.prenom}</Text>
        <Text style={styles.info}>Location: {getLocationName(item.locationId)}</Text>
        <Text style={styles.info}>Département: {getDepartementName(item.departementId)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat avec Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher par nom/prénom"
        value={search}
        onChangeText={setSearch}
      />
      <TextInput
        style={styles.input}
        placeholder="Filtrer par locationId"
        value={locationFilter}
        onChangeText={setLocationFilter}
      />
      <TextInput
        style={styles.input}
        placeholder="Filtrer par departementId"
        value={departementFilter}
        onChangeText={setDepartementFilter}
      />
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={filteredAdmins}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucun admin trouvé.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold' },
  info: { color: '#555' },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
});

export default ChatServiceScreen;

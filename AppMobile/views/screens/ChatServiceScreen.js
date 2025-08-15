import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ChatServiceScreen = ({ navigation }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [departementFilter, setDepartementFilter] = useState('');
  const [locations, setLocations] = useState([]);
  const [departements, setDepartements] = useState([]);

  useEffect(() => {
    fetchLocations();
    fetchDepartements();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [locationFilter, departementFilter]);
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

  // Trouver le nom du site et du département à partir de l'id
  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.nom : '';
  };
  const getDepartementName = (id) => {
    const dep = departements.find(d => d.id === id);
    return dep ? dep.nom : '';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatConversation', { admin: item })}>
      <Text style={styles.name}>{item.nom} {item.prenom}</Text>
      <Text style={styles.info}>Location: {getLocationName(item.locationId)}</Text>
      <Text style={styles.info}>Département: {getDepartementName(item.departementId)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat avec Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher par nom/prénom"
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Filtrer par site :</Text>
        <Picker
          selectedValue={locationFilter}
          onValueChange={setLocationFilter}
          style={styles.picker}
        >
          <Picker.Item label="Tous les sites" value="" />
          {locations.map(loc => (
            <Picker.Item key={loc.id} label={loc.nom} value={loc.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Filtrer par département :</Text>
        <Picker
          selectedValue={departementFilter}
          onValueChange={setDepartementFilter}
          style={styles.picker}
        >
          <Picker.Item label="Tous les départements" value="" />
          {departements.map(dep => (
            <Picker.Item key={dep.id} label={dep.nom} value={dep.id} />
          ))}
        </Picker>

      </View>
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
  pickerContainer: { marginBottom: 8 },
  pickerLabel: { fontWeight: 'bold', marginBottom: 4 },
  picker: { backgroundColor: '#f5f5f5', borderRadius: 8 },
});

export default ChatServiceScreen;

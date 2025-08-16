import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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

  const getLocationName = (id) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.nom : 'Non spécifié';
  };

  const getDepartementName = (id) => {
    const dep = departements.find(d => d.id === id);
    return dep ? dep.nom : 'Non spécifié';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ChatConversation', { admin: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFD']}
        style={styles.itemGradient}
      >
        <Text style={styles.name}>{item.nom} {item.prenom}</Text>
        <Text style={styles.info}>Site: {getLocationName(item.locationId)}</Text>
        <Text style={styles.info}>Département: {getDepartementName(item.departementId)}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F5F7FB', '#E8ECEF']}
        style={styles.header}
      >
        <Text style={styles.title}>Chat avec le Service</Text>
      </LinearGradient>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Rechercher par nom/prénom"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Filtrer par site :</Text>
          <View style={styles.pickerWrapper}>
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
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Filtrer par département :</Text>
          <View style={styles.pickerWrapper}>
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
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D2D51" />
            <Text style={styles.loadingText}>Chargement des administrateurs...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAdmins}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>Aucun administrateur trouvé.</Text>}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F8FAFD',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    color: '#1D2D51',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D2D51',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  pickerWrapper: {
    borderRadius: 12,
    backgroundColor: '#F8FAFD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#F8FAFD',
    color: '#1D2D51',
  },
  list: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  item: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    maxWidth: width - 40,
    alignSelf: 'center',
  },
  itemGradient: {
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  info: {
    fontSize: 14,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    lineHeight: 20,
  },
  empty: {
    fontSize: 16,
    color: '#1D2D51',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default ChatServiceScreen;
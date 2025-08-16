import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, SafeAreaView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../../context/UserContext';

const { width } = Dimensions.get('window');

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('LeaveRequest', { leave: item })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F9FBFC']}
        style={styles.itemGradient}
      >
        <Text style={styles.type}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} ({new Date(item.startDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' })} → {new Date(item.endDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' })})
        </Text>
        <Text style={styles.status}>Statut : {item.status}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F5F7FA', '#E9EDF0']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes demandes de congé</Text>
        </View>
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLeaves} colors={['#4f8cff']} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune demande de congé</Text>}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('LeaveRequest')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4f8cff', '#3b7aff']}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>+ Demander un congé</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  },
  header: {
    padding: 20,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D2D51',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  list: {
    padding: 20,
    flexGrow: 1,
  },
  item: {
    marginBottom: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    maxWidth: width - 40,
    alignSelf: 'center',
  },
  itemGradient: {
    borderRadius: 14,
    padding: 16,
    overflow: 'hidden',
  },
  type: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  status: {
    fontSize: 14,
    color: '#4f8cff',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  emptyText: {
    fontSize: 16,
    color: '#1D2D51',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabGradient: {
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
});

export default MyLeavesScreen;
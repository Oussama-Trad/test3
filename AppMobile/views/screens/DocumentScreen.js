import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../../context/UserContext';

const { width } = Dimensions.get('window');

const DocumentScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/conversations?employeeId=${user.id}`);
      const data = await res.json();
      setConversations(data);
    } catch (e) {
      setConversations([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ChatConversation', { admin: item.admin })}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F9FBFC']}
        style={styles.itemGradient}
      >
        <View style={styles.itemContent}>
          <Text style={styles.name}>{item.admin.nom} {item.admin.prenom}</Text>
          <Text style={styles.info} numberOfLines={1}>Dernier message : {item.lastMessage}</Text>
          <Text style={styles.date}>Date : {new Date(item.lastDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F5F7FB', '#E9EDF0']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mes documents</Text>
          <TouchableOpacity
            style={styles.newMsgBtn}
            onPress={() => navigation.navigate('ChatService')}
            activeOpacity={0.7}
          >
            <Text style={styles.newMsgBtnText}>Demander un document</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D2D51" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.admin._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucune conversation trouvée</Text>}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  newMsgBtn: {
    backgroundColor: '#4f8cff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  newMsgBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  list: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 20,
  },
  item: {
    marginBottom: 12,
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
    overflow: 'hidden',
  },
  itemContent: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D2D51',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  info: {
    fontSize: 14,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    marginTop: 6,
    textAlign: 'right',
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

export default DocumentScreen;
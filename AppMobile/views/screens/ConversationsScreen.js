import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../../context/UserContext';

const { width } = Dimensions.get('window');

const ConversationsScreen = ({ navigation }) => {
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
        colors={['#FFFFFF', '#F8FAFD']}
        style={styles.itemGradient}
      >
        <Text style={styles.name}>{item.admin.nom} {item.admin.prenom}</Text>
        <Text style={styles.info} numberOfLines={1}>Dernier message : {item.lastMessage}</Text>
        <Text style={styles.date}>Date : {new Date(item.lastDate).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F5F7FB', '#E8ECEF']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mes conversations</Text>
          <TouchableOpacity
            style={styles.newMsgBtn}
            onPress={() => navigation.navigate('ChatService')}
            activeOpacity={0.7}
          >
            <Text style={styles.newMsgBtnText}>Nouveau message</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D2D51" />
          <Text style={styles.loadingText}>Chargement des conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.admin._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucune conversation trouvée.</Text>}
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
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  newMsgBtn: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  date: {
    fontSize: 12,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    marginTop: 4,
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

export default ConversationsScreen;
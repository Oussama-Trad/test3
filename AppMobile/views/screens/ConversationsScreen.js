import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { UserContext } from '../../context/UserContext';

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
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatConversation', { admin: item.admin })}>
      <Text style={styles.name}>{item.admin.nom} {item.admin.prenom}</Text>
      <Text style={styles.info}>Dernier message : {item.lastMessage}</Text>
      <Text style={styles.info}>Date : {new Date(item.lastDate).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mes conversations</Text>
        <TouchableOpacity style={styles.newMsgBtn} onPress={() => navigation.navigate('ChatService')}>
          <Text style={styles.newMsgBtnText}>Nouveau message</Text>
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.admin._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Aucune conversation.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  newMsgBtn: { backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  newMsgBtnText: { color: '#fff', fontWeight: 'bold' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold' },
  info: { color: '#555' },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
});

export default ConversationsScreen;

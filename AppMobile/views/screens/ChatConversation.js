import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';


const ChatConversation = ({ route }) => {
  const { user } = useContext(UserContext);
  const CURRENT_USER_ID = user?.id || '';
  const { admin } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Optionnel : polling toutes les 3s pour simuler du temps réel
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
  const url = `http://localhost:5000/api/messages?user1=${CURRENT_USER_ID}&user2=${admin._id}`;
      const res = await fetch(url);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      setMessages([]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: CURRENT_USER_ID,
          receiverId: admin._id,
          message: input.trim(),
        }),
      });
      setInput('');
      fetchMessages();
    } catch (e) {}
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.senderId === CURRENT_USER_ID ? styles.myMessage : styles.theirMessage]}>
      <Text style={styles.messageText}>{item.content || item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{admin.nom} {admin.prenom}</Text>
        <Text style={styles.headerInfo}>Location: {admin.locationId} | Département: {admin.departementId}</Text>
      </View>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerInfo: { color: '#555', marginTop: 4 },
  messageContainer: { marginBottom: 12, padding: 10, borderRadius: 8, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#d1e7dd' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#f8d7da' },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: '#888', marginTop: 4, textAlign: 'right' },
  inputContainer: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center' },
});

export default ChatConversation;

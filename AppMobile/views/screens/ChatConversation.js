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

  const renderItem = ({ item }) => {
    // Supporte senderId ou sender_id
    const sender = item.senderId !== undefined ? item.senderId : item.sender_id;
    const isMine = sender === CURRENT_USER_ID;
    return (
      <View style={[styles.messageRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}> 
        {!isMine && (
          <View style={styles.avatar}><Text style={styles.avatarText}>{admin.prenom?.[0] || 'A'}</Text></View>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.messageText, isMine ? styles.textMine : styles.textTheirs]}>{item.content || item.message}</Text>
          <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        {isMine && (
          <View style={styles.avatarSelf}><Text style={styles.avatarText}>{user?.prenom?.[0] || 'M'}</Text></View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{admin.nom} {admin.prenom}</Text>
        <Text style={styles.headerInfo}>
          {admin.locationId ? `Location: ${admin.locationId}` : ''}
          {admin.locationId && admin.departementId ? ' | ' : ''}
          {admin.departementId ? `Département: ${admin.departementId}` : ''}
        </Text>
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
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, paddingHorizontal: 4 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4f8cff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarSelf: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#00b894', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bubble: { maxWidth: '70%', padding: 12, borderRadius: 18, minWidth: 60 },
  bubbleMine: { backgroundColor: '#4f8cff', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#e3e9f7', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  textMine: { color: '#fff' },
  textTheirs: { color: '#222' },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  timestampMine: { color: '#cce0ff' },
  timestampTheirs: { color: '#888' },
  inputContainer: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, justifyContent: 'center' },
});

export default ChatConversation;

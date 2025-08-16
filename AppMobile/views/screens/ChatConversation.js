import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    const sender = item.senderId !== undefined ? item.senderId : item.sender_id;
    const isMine = sender === CURRENT_USER_ID;
    return (
      <View style={[styles.messageRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
        {!isMine && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{admin.prenom?.[0] || 'A'}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.messageText, isMine ? styles.textMine : styles.textTheirs]}>
            {item.content || item.message}
          </Text>
          <Text style={[styles.timestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isMine && (
          <View style={styles.avatarSelf}>
            <Text style={styles.avatarText}>{user?.prenom?.[0] || 'M'}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LinearGradient
          colors={['#F5F7FB', '#E8ECEF']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{admin.nom} {admin.prenom}</Text>
          <Text style={styles.headerInfo}>
            {admin.locationId ? `Location: ${admin.locationId}` : ''}
            {admin.locationId && admin.departementId ? ' | ' : ''}
            {admin.departementId ? `Département: ${admin.departementId}` : ''}
          </Text>
        </LinearGradient>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D2D51" />
            <Text style={styles.loadingText}>Chargement des messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.7}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D2D51',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  headerInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  list: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#F5F7FB',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f8cff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  avatarSelf: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00b894',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  bubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 80,
  },
  bubbleMine: {
    backgroundColor: '#4f8cff',
    borderBottomRightRadius: 6,
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    backgroundColor: '#E8ECEF',
    borderBottomLeftRadius: 6,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  textMine: {
    color: '#fff',
  },
  textTheirs: {
    color: '#1D2D51',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  timestampMine: {
    color: '#cce0ff',
  },
  timestampTheirs: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDE1E6',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F8FAFD',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
    color: '#1D2D51',
  },
  sendButton: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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

export default ChatConversation;
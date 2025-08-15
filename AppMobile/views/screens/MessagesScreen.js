import React from 'react';
import ChatServiceScreen from './ChatServiceScreen';

// Ce composant sert de wrapper pour la messagerie interne
const MessagesScreen = (props) => <ChatServiceScreen {...props} />;

export default MessagesScreen;

import LeaveRequestForm from './views/screens/LeaveRequestForm';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './views/screens/SplashScreen';
import AuthScreen from './views/screens/AuthScreen';
import ProfileScreen from './views/screens/ProfileScreen';
import EditProfileScreen from './views/screens/EditProfileScreen';
import LoginScreen from './views/screens/LoginScreen';
import RegisterScreen from './views/screens/RegisterScreen';
import ConversationsScreen from './views/screens/ConversationsScreen';
import DocumentScreen from './views/screens/DocumentScreen';
import ActualiteDetailScreen from './views/screens/ActualiteDetailScreen';
import EventsScreen from './views/screens/EventsScreen';
import EventDetailScreen from './views/screens/EventDetailScreen';
import ChatServiceScreen from './views/screens/ChatServiceScreen';
import ChatConversation from './views/screens/ChatConversation';
import HomeScreen from './views/screens/HomeScreen';
import PartenariatsScreen from './views/screens/PartenariatsScreen';
import { UserProvider, UserContext } from './context/UserContext';
import React, { useContext } from 'react';

import ReclamationsScreen from './views/screens/ReclamationsScreen';







import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import ActualitesScreen from './views/screens/ActualitesScreen';
import MyLeavesScreen from './views/screens/MyLeavesScreen';
function MainTabs() {
  const { user } = useContext(UserContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Actualités') iconName = 'newspaper';
          else if (route.name === 'Documents') iconName = 'document';
          else if (route.name === 'Mon Profil') iconName = 'person';
          else if (route.name === 'Messagerie') iconName = 'chatbubble';
           else if (route.name === 'Congés') iconName = 'calendar';
           else if (route.name === 'Partenariats') iconName = 'handshake';
           else if (route.name === 'Réclamations') iconName = 'alert-circle';
          else iconName = 'home';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1D2D51',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#1D2D51' },
        headerTintColor: '#fff',
        headerTitle: user ? `${user.nom} ${user.prenom}` : '',
        tabBarStyle: { backgroundColor: '#fff' },
      })}
    >
  <Tab.Screen name="Actualités" component={ActualitesScreen} />
  <Tab.Screen name="Documents" component={DocumentScreen} />
  <Tab.Screen name="Partenariats" component={PartenariatsScreen} />
  <Tab.Screen name="Réclamations" component={ReclamationsScreen} />
  <Tab.Screen name="Congés" component={MyLeavesScreen} />
  <Tab.Screen name="Mon Profil" component={ProfileScreen} />
  <Tab.Screen name="Messagerie" component={ConversationsScreen} />
  <Tab.Screen name="Événements" component={EventsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ActualiteDetail" component={require('./views/screens/ActualiteDetailScreen').default} options={{ headerShown: true, title: 'Détail actualité' }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Détail événement' }} />
          <Stack.Screen name="ChatService" component={ChatServiceScreen} options={{ headerShown: true, title: 'Chat avec Service' }} />
          <Stack.Screen name="ChatConversation" component={ChatConversation} options={{ headerShown: true, title: 'Conversation' }} />
            <Stack.Screen name="LeaveRequest" component={LeaveRequestForm} options={{ headerShown: true, title: 'Demande de congé' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

import React, { useContext } from 'react';
import SplashScreen from './views/screens/SplashScreen';
import AuthScreen from './views/screens/AuthScreen';
import ProfileScreen from './views/screens/ProfileScreen';
import EditProfileScreen from './views/screens/EditProfileScreen';
import LoginScreen from './views/screens/LoginScreen';
import RegisterScreen from './views/screens/RegisterScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './views/screens/HomeScreen';
import MessagesScreen from './views/screens/MessagesScreen';
import DocumentScreen from './views/screens/DocumentScreen';
import { UserProvider, UserContext } from './context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useContext(UserContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Accueil') iconName = 'home';
          else if (route.name === 'Mon Profil') iconName = 'person';
          else if (route.name === 'Messagerie') iconName = 'chatbubble';
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
  <Tab.Screen name="Accueil" component={HomeScreen} />
  <Tab.Screen name="Documents" component={DocumentScreen} />
  <Tab.Screen name="Mon Profil" component={ProfileScreen} />
  <Tab.Screen name="Messagerie" component={MessagesScreen} />
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
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

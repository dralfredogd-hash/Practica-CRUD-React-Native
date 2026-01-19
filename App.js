import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWindowDimensions, Text, View } from 'react-native';

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { ToastProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import { ThemeContext } from './context/ThemeContext';

import SplashScreen from './screens/SplashScreen';
import CustomDrawerContent from './navigation/CustomDrawerContent';

// Screens
import MainScreen from './screens/MainScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ContactScreen from './screens/ContactScreen';
import BolseoScreen from './screens/BolseoScreen';
import ManufacturaScreen from './screens/ManufacturaScreen';
import LaminadoScreen from './screens/LaminadoScreen';
import CorteRefiladoScreen from './screens/CorteRefiladoScreen';
import DiariaDobladoScreen from './screens/DiariaDobladoScreen';
import ImpresionScreen from './screens/ImpresionScreen';
import FlejeScreen from './screens/FlejeScreen';
import PeletizadoScreen from './screens/PaletizadoScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import AdminProfileScreen from './screens/AdminProfileScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

/* =========================
   Error Boundary
========================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: '#900', fontWeight: '700', marginBottom: 8 }}>
            Error en la aplicación
          </Text>
          <Text style={{ color: '#900' }}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

/* =========================
   App
========================= */
export default function App() {
  const { width } = useWindowDimensions();
  const drawerWidth = width * 0.55;

  // Splash
  const [showSplash, setShowSplash] = useState(false);
  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // UI / Theme
  const [toolbarColor, setToolbarColor] = useState('#d35400');
  const palette = { bg: '#ffffff', primary: '#d35400', text: '#333333' };

  // Auth
  const [registeredUser, setRegisteredUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('Alfredo Giacinti Reyes');
  const [userProfile, setUserProfile] = useState(null);

  return (
    <ThemeContext.Provider
      value={{
        toolbarColor,
        setToolbarColor,
        palette,
        registeredUser,
        setRegisteredUser,
        authenticated,
        setAuthenticated,
        isAdmin,
        setIsAdmin,
        userName,
        setUserName,
        userProfile,
        setUserProfile,
      }}
    >
      <ErrorBoundary>
        <GluestackUIProvider config={config}>
          {/* SplashScreen como capa */}
          {showSplash && (
            <SplashScreen onFinish={handleSplashFinish} />
          )}

          {/* App principal */}
          {!showSplash && (
            <NavigationContainer>
              {!authenticated ? (
                <Stack.Navigator initialRouteName="Register">
                  <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AdminLogin"
                    component={require('./screens/AdminLoginScreen').default}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ResetPassword"
                    component={ResetPasswordScreen}
                    options={{ headerShown: false }}
                  />
                </Stack.Navigator>
              ) : isAdmin ? (
                <Drawer.Navigator
                  initialRouteName="AdminDashboard"
                  drawerContent={(props) => <CustomDrawerContent {...props} />}
                  screenOptions={{
                    headerShown: true,
                    headerStyle: { backgroundColor: toolbarColor },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                    drawerWidth: drawerWidth,
                  }}
                >
                  <Drawer.Screen
                    name="AdminDashboard"
                    component={require('./screens/AdminDashboard').default}
                    options={{ title: 'Dashboard' }}
                  />
                  <Drawer.Screen
                    name="AdminEmployees"
                    component={require('./screens/AdminEmployees').default}
                    options={{ title: 'Empleados' }}
                  />
                  <Drawer.Screen
                    name="AdminProfile"
                    component={AdminProfileScreen}
                    options={{ title: 'Perfil' }}
                  />
                </Drawer.Navigator>
              ) : (
                <Drawer.Navigator
                  initialRouteName="Home"
                  drawerContent={(props) => <CustomDrawerContent {...props} />}
                  screenOptions={{
                    headerShown: true,
                    headerStyle: { backgroundColor: toolbarColor },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                    drawerActiveTintColor: '#ffffff',
                    drawerActiveBackgroundColor: toolbarColor,
                    drawerInactiveTintColor: '#333',
                    drawerWidth: drawerWidth,
                  }}
                >
                  <Drawer.Screen name="Home" component={MainScreen} options={{ title: 'Inicio' }} />
                  <Drawer.Screen name="Bolseo" component={BolseoScreen} />
                  <Drawer.Screen name="Manufactura" component={ManufacturaScreen} />
                  <Drawer.Screen name="Laminado" component={LaminadoScreen} />
                  <Drawer.Screen name="CorteRefilado" component={CorteRefiladoScreen} />
                  <Drawer.Screen name="DiariaDoblado" component={DiariaDobladoScreen} />
                  <Drawer.Screen name="Fleje" component={FlejeScreen} />
                  <Drawer.Screen name="Peletizado" component={PeletizadoScreen} />
                  <Drawer.Screen name="Impresion" component={ImpresionScreen} />
                  <Drawer.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Perfil' }} />
                  <Drawer.Screen name="Contacto" component={ContactScreen} />
                </Drawer.Navigator>
              )}
            </NavigationContainer>
          )}
        </GluestackUIProvider>
      </ErrorBoundary>
    </ThemeContext.Provider>
  );
}

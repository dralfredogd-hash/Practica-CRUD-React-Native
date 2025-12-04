import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import FormsScreen from './screens/FormsScreen';
import DisplayScreen from './screens/DisplayScreen';
import CustomDrawerContent from './navigation/CustomDrawerContent';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { ThemeContext } from './context/ThemeContext';
import ProfileScreen from './screens/ProfileScreen';
import PruebaScreen from './screens/PruebaScreen';
import CrudScreen from './screens/CrudScreen';
import { ToastProvider } from '@gluestack-ui/themed';


const Drawer = createDrawerNavigator();

export default function App() {
  const [toolbarColor, setToolbarColor] = useState('#1976d2');
  const [userName] = useState('Alfredo Giacinti Reyes');

  return (
    <ThemeContext.Provider value={{ toolbarColor, setToolbarColor, userName }}>
      <NavigationContainer>
        <GluestackUIProvider config={config}>
          
          <Drawer.Navigator
            initialRouteName="Forms"
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerStyle: { backgroundColor: toolbarColor },
              headerTintColor: '#fff',
              drawerActiveTintColor: '#ffffff',
              drawerActiveBackgroundColor: toolbarColor,
              drawerInactiveTintColor: '#333',
            }}
          >
            <Drawer.Screen
              name="Forms"
              component={FormsScreen}
              options={{ title: 'Alfredo Giacinti Reyes' }}
            />
            <Drawer.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ 
                title: 'Mi Perfil',
                headerTitle: 'Perfil de Usuario'
              }} 
            />
            <Drawer.Screen 
              name="Display" 
              component={DisplayScreen} 
              options={{ 
                title: 'Display de usuario' 
              }} 
            />
            <Drawer.Screen
              name="Prueba"
              component={PruebaScreen}
              options={{
                title: 'Prueba',
                headerTitle: 'Vista de Prueba'
              }}
            />
            <Drawer.Screen
              name="Crud"
              component={CrudScreen}
              options={{
                title: 'Prueba',
                headerTitle: 'Vista de Prueba'
              }}
            />
          </Drawer.Navigator>
         
        </GluestackUIProvider>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
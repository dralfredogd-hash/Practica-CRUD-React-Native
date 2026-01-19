import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { ThemeContext } from '../context/ThemeContext'; 
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#6a1b9a', '#0097a7'];

export default function CustomDrawerContent(props) {
    const { setToolbarColor, userName, authenticated, setAuthenticated, setUserName, setRegisteredUser, isAdmin, setIsAdmin } = useContext(ThemeContext);
    
    const focusedRoute = props.state && props.state.routeNames && typeof props.state.index === 'number'
        ? props.state.routeNames[props.state.index]
        : null;

    const handleSignOut = async () => {
        try {
            // Cerrar sesión en Firebase
            await signOut(auth);
            
            // Limpiar estado local
            setAuthenticated(false);
            setUserName('');
            setRegisteredUser(null);
            setIsAdmin(false);
            
            // Cerrar drawer
            props.navigation.closeDrawer();
            
            console.log('Sesión cerrada exitosamente');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert(
                'Error',
                'No se pudo cerrar la sesión. Inténtalo de nuevo.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      
    <View style={styles.header}>
        <Text style={styles.headerText}>Hola, {userName.split(' ')[0]}</Text>
    </View>

      
            {isAdmin ? (
              <View style={{ padding: 12 }}>
                <DrawerItem
                  label="Dashboard"
                  focused={focusedRoute === 'AdminDashboard'}
                  onPress={() => props.navigation.navigate('AdminDashboard')}
                  icon={() => <Ionicons name="speedometer-outline" size={20} />}
                />
                <DrawerItem
                  label="Empleados registrados"
                  focused={focusedRoute === 'AdminEmployees'}
                  onPress={() => props.navigation.navigate('AdminEmployees')}
                  icon={() => <Ionicons name="people-outline" size={20} />}
                />
                <DrawerItem
                  label="Mi Perfil"
                  focused={focusedRoute === 'AdminProfile'}
                  onPress={() => props.navigation.navigate('AdminProfile')}
                  icon={() => <Ionicons name="person-circle-outline" size={20} />}
                />
              </View>
            ) : (
              <View style={{ padding: 12 }}>
                <DrawerItem
                    label="Inicio"
                    focused={focusedRoute === 'Home'}
                    onPress={() => props.navigation.navigate('Home')}
                    icon={() => <Ionicons name="home-outline" size={20} />}
                    style={focusedRoute === 'Home' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Home' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Bolseo"
                    focused={focusedRoute === 'Bolseo'}
                    onPress={() => props.navigation.navigate('Bolseo')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'Bolseo' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Bolseo' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Manufactura"
                    focused={focusedRoute === 'Manufactura'}
                    onPress={() => props.navigation.navigate('Manufactura')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'Manufactura' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Manufactura' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Laminado"
                    focused={focusedRoute === 'Laminado'}
                    onPress={() => props.navigation.navigate('Laminado')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'Laminado' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Laminado' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Corte y Refilado"
                    focused={focusedRoute === 'CorteRefilado'}
                    onPress={() => props.navigation.navigate('CorteRefilado')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'CorteRefilado' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'CorteRefilado' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Diaria de Doblado"
                    focused={focusedRoute === 'DiariaDoblado'}
                    onPress={() => props.navigation.navigate('DiariaDoblado')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'DiariaDoblado' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'DiariaDoblado' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Impresión"
                    focused={focusedRoute === 'Impresion'}
                    onPress={() => props.navigation.navigate('Impresion')}
                    icon={() => <Ionicons name="document-text-outline" size={20} />}
                    style={focusedRoute === 'Impresion' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Impresion' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Fleje"
                    focused={focusedRoute === 'Fleje'}
                    onPress={() => props.navigation.navigate('Fleje')}
                    icon={() => <Ionicons name="layers-outline" size={20} />}
                    style={focusedRoute === 'Fleje' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Fleje' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Peletizado"
                    focused={focusedRoute === 'Peletizado'}
                    onPress={() => props.navigation.navigate('Peletizado')}
                    icon={() => <Ionicons name="analytics-outline" size={20} />}
                    style={focusedRoute === 'Peletizado' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Peletizado' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Contacto"
                    focused={focusedRoute === 'Contacto' || focusedRoute === 'Contact'}
                    onPress={() => props.navigation.navigate('Contacto')}
                    icon={() => <Ionicons name="call-outline" size={20} />}
                    style={focusedRoute === 'Contacto' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'Contacto' ? styles.drawerLabelActive : null}
                />
                <DrawerItem
                    label="Mi Perfil"
                    focused={focusedRoute === 'UserProfile'}
                    onPress={() => props.navigation.navigate('UserProfile')}
                    icon={() => <Ionicons name="person-circle-outline" size={20} />}
                    style={focusedRoute === 'UserProfile' ? styles.drawerItemActive : null}
                    labelStyle={focusedRoute === 'UserProfile' ? styles.drawerLabelActive : null}
                />
              </View>
            )}

                        {authenticated && (
                            <View style={{ paddingHorizontal: 12 }}>
                                <DrawerItem
                                    label="Cerrar sesión"
                                    onPress={handleSignOut}
                                    icon={() => <Ionicons name="exit-outline" size={20} />}
                                />
                            </View>
                        )}

      
<View style={{ padding: 12 }}>
        <Text style={{ marginBottom: 8, fontWeight: '600' }}>Elige color del toolbar</Text>
        <View style={styles.colorRow}>
{colors.map(c => (
            <Pressable
            key={c}
            onPress={() => {
                setToolbarColor(c);
                props.navigation.closeDrawer();
}}
style={[styles.colorBox, { backgroundColor: c }]}
            />
))}
        </View>
</View>

    
<View style={{ flex: 1 }} />
<View style={{ padding: 12 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
Induspack Mexico , Aguascalientes Ags 2026
        </Text>
</View>
    </DrawerContentScrollView>
);
}

const styles = StyleSheet.create({
header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
},
headerText: {
    fontSize: 18,
    fontWeight: '700',
},
colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
},
colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: '#ddd',
},
drawerItemActive: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    marginVertical: 4,
},
drawerLabelActive: {
    color: '#fff',
    fontWeight: '600',
},
});

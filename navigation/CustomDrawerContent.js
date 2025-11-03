import React, { useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { ThemeContext } from '../context/ThemeContext'; 
import { Ionicons } from '@expo/vector-icons';

const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#6a1b9a', '#0097a7'];

export default function CustomDrawerContent(props) {
  const { setToolbarColor, userName } = useContext(ThemeContext);

return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      
    <View style={styles.header}>
        <Text style={styles.headerText}>Hola, {userName.split(' ')[0]}</Text>
    </View>

      
    <View style={{ padding: 12 }}>
        <DrawerItem
label="Forms"
onPress={() => props.navigation.navigate('Forms')}
icon={() => <Ionicons name="document-text-outline" size={20} />}
        />
</View>

      
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
Proyecto: Gluestack Forms - Demo
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
});

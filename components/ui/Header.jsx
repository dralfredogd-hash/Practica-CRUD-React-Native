import React, { useContext } from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { ThemeContext } from '../../context/ThemeContext';

export default function Header({ title, subtitle, showLogo = true }) {
  const { palette, userName } = useContext(ThemeContext);
  const { width } = useWindowDimensions();

  // Breakpoints: phone < 600, tablet >= 600
  const isTablet = width >= 600;

  const dynamicStyles = {
    container: {
      backgroundColor: palette.primary,
      paddingVertical: isTablet ? 16 : 10,
      paddingHorizontal: isTablet ? 20 : 14,
      borderBottomLeftRadius: isTablet ? 10 : 8,
      borderBottomRightRadius: isTablet ? 10 : 8,
    },
    logo: {
      width: isTablet ? 64 : 48,
      height: isTablet ? 48 : 36,
      marginRight: isTablet ? 14 : 10,
    },
    title: {
      fontSize: isTablet ? 20 : 18,
      color: '#fff',
    },
    subtitle: {
      marginTop: 2,
      color: 'rgba(255,255,255,0.9)',
      fontSize: isTablet ? 13 : 12,
    },
    userName: {
      color: 'rgba(255,255,255,0.95)',
      fontWeight: '600',
      fontSize: isTablet ? 14 : 12,
    },
    right: {
      minWidth: isTablet ? 180 : 100,
      alignItems: 'flex-end',
    }
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}> 
      <View style={styles.left}>
        {showLogo && (
          <Image source={require('../../assets/Induspack-logo.png')} style={[styles.logo, dynamicStyles.logo]} resizeMode="contain" />
        )}
        <View style={styles.textBox}>
          <Text fontWeight="800" style={dynamicStyles.title}>{title}</Text>
          {subtitle ? <Text style={dynamicStyles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={dynamicStyles.right}>
        {userName ? <Text style={dynamicStyles.userName} numberOfLines={1}>{userName}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logo: {},
  textBox: { justifyContent: 'center', flexShrink: 1 },
});

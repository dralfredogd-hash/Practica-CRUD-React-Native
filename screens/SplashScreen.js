import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import Logo from '../assets/Induspack-logo.png';

const { width } = Dimensions.get('window');
const logoSize = Math.min(width * 0.5, 220);

export default function SplashScreen({ onFinish }) {
  const { palette } = useContext(ThemeContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    console.log('SplashScreen mounted');

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Timer para cerrar splash
    const timer = setTimeout(() => {
      console.log('SplashScreen finishing');

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('SplashScreen calling onFinish');
        if (typeof onFinish === 'function') {
          onFinish();
        }
      });
    }, 2500);

    return () => {
      console.log('SplashScreen unmounting');
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette?.primary || '#d35400' },
      ]}
    >
      {/* Logo animado */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={Logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* Texto */}
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Induspack México</Text>
        <Text style={styles.subtitle}>
          Soluciones integrales en empaque y embalaje
        </Text>
      </Animated.View>

      {/* Loader */}
      <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#fff" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    padding: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: width - 80,
    lineHeight: 22,
  },
  loaderContainer: {
    marginTop: 20,
  },
});

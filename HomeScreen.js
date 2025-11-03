import React from 'react';
import { View } from 'react-native';
import { Text } from '@gluestack-ui/themed';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text size="xl" bold>
        Bienvenido a la app de AGR...
      </Text>
    </View>
  );
}

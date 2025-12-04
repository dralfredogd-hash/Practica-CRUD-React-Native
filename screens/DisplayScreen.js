import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonText,
  Card,
  Heading,
  Image,
  Text,
  VStack,
  Center,
  HStack,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const CustomToast = ({ visible, message, description, onHide }) => {
  if (!visible) return null;

  return (
    <Box
      position="absolute"
      top="$16"
      left="$4"
      right="$4"
      zIndex={999}
      bg="$white"
      borderRadius="$md"
      p="$3"
      shadowColor="$black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={3.84}
      elevation={5}
    >
      <HStack space="sm" alignItems="center">
        <MaterialIcons
          name="check-circle"
          size={20}
          color="green"
        />
        <VStack flex={1}>
          <Text color="green" fontWeight="bold" fontSize="$sm">
            {message}
          </Text>
          <Text color="green" fontSize="$xs">
            {description}
          </Text>
        </VStack>
        <Button variant="link" size="sm" onPress={onHide} px="$2">
          <ButtonText color="green">✕</ButtonText>
        </Button>
      </HStack>
    </Box>
  );
};

export default function DisplayScreen() {
  const [inCart, setInCart] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    setInCart(true);
    setIsAvailable(false);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleReset = () => {
    setInCart(false);
    setIsAvailable(true);
    setShowToast(false);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  return (
    <Center flex={1} bg="$backgroundLight0" p="$4">
      
      <CustomToast
        visible={showToast}
        message="Producto agregado"
        description="Se agregó al carrito correctamente."
        onHide={hideToast}
      />
      <Card size="lg" variant="elevated" p="$4" w="$80" maxW="$96" borderRadius="$2xl" mb="$4">
        <Center mb="$4">
          <Image
            source={{ uri: 'https://gluestack.github.io/public-blog-video-assets/saree.png' }}
            alt="Fashion item"
            w="$full"
            h={240}
            borderRadius="$md"
          />
        </Center>

        <Text size="sm" color="$textLight600">
          Fashion Clothing
        </Text>

        <VStack space="xs" mt="$2" mb="$4">
          <Heading size="md" color="$textLight900">
            Cotton Kurta
          </Heading>
          <Text size="sm" color="$textLight700">
            Floral embroidered notch neck thread work cotton kurta in white and black.
          </Text>
        </VStack>

        <Box flexDirection="row" justifyContent="space-between" space="sm">
          <Button
            bg={isAvailable ? '$primary600' : '$gray500'}
            flex={1}
            mr="$2"
            onPress={handleAddToCart}
            disabled={!isAvailable}
          >
            <ButtonText color="white">
              {isAvailable ? 'Add to cart' : 'Agotado'}
            </ButtonText>
          </Button>

          <Button variant="outline" flex={1}>
            <ButtonText color="$textLight700">Wishlist</ButtonText>
          </Button>
        </Box>
      </Card>

      <Card size="md" variant="outline" p="$4" w="$80" maxW="$96" borderRadius="$xl">
        <Heading size="sm" mb="$3" color="$textLight900">
          Tabla de Productos
        </Heading>

        <HStack justifyContent="space-between" mb="$2">
          <Text fontWeight="bold">Producto</Text>
          <Text fontWeight="bold">Precio</Text>
          <Text fontWeight="bold">ST</Text>
        </HStack>
        <HStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="$borderLight200" py="$2">
          <Text>Cotton Kurta</Text>
          <Text>$350</Text>
          <HStack space="sm" alignItems="center">
            <Badge
              variant="solid"
              bg={isAvailable ? '$green600' : '$red600'}
              action={isAvailable ? 'success' : 'error'}
            >
              <MaterialIcons
                name={isAvailable ? 'check-circle' : 'cancel'}
                size={14}
                color="white"
              />
              <BadgeText color="white" ml="$1">
                {isAvailable ? 'Disponible' : 'Agotado'}
              </BadgeText>
            </Badge>

            <FontAwesome
              name="shopping-cart"
              size={18}
              color={inCart ? 'green' : 'gray'}
            />
          </HStack>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor="$borderLight200" py="$2">
          <Text>Anime Figure</Text>
          <Text>$1200</Text>
          <HStack space="sm" alignItems="center">
            <Badge variant="solid" bg="$red600" action="error">
              <MaterialIcons
                name="cancel"
                size={14}
                color="white"
              />
              <BadgeText color="white" ml="$1">
                Agotado
              </BadgeText>
            </Badge>
            <FontAwesome
              name="shopping-cart"
              size={18}
              color={'gray'}
            />
          </HStack>
        </HStack>
      </Card>

      <Button mt="$4" variant="outline" onPress={handleReset}>
        <ButtonText color="$textLight700">Vaciar carrito</ButtonText>
      </Button>
    </Center>
  );
}
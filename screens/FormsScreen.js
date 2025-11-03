import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Pressable, View, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormControlLabel,
  Textarea,
  Icon,
  Link,
  Box,
  VStack,
  HStack,
  Text,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

export default function FormsScreen() {
  const { toolbarColor, userName } = useContext(ThemeContext);

  const [checkedVals, setCheckedVals] = useState(['banana']);
  const [radioVal, setRadioVal] = useState('option1');
  const [selectVal, setSelectVal] = useState('value1');
  const [showSelect, setShowSelect] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);
  const [switchVal, setSwitchVal] = useState(false);
  const [textAreaVal, setTextAreaVal] = useState('');
  const [pressed, setPressed] = useState(false);

 
  console.log('Gluestack imports check:', {
    Checkbox: typeof Checkbox,
    CheckboxGroup: typeof CheckboxGroup,
    Radio: typeof Radio,
    RadioGroup: typeof RadioGroup,
    Select: typeof Select,
    SelectTrigger: typeof SelectTrigger,
    SelectInput: typeof SelectInput,
    SelectPortal: typeof SelectPortal,
    SelectBackdrop: typeof SelectBackdrop,
    SelectContent: typeof SelectContent,
    SelectItem: typeof SelectItem,
    Slider: typeof Slider,
    SliderTrack: typeof SliderTrack,
    SliderFilledTrack: typeof SliderFilledTrack,
    SliderThumb: typeof SliderThumb,
    Switch: typeof Switch,
    FormControl: typeof FormControl,
    FormControlLabel: typeof FormControlLabel,
    TextArea: typeof TextArea,
    Icon: typeof Icon,
    Link: typeof Link,
    Box: typeof Box,
    VStack: typeof VStack,
    HStack: typeof HStack,
    Text: typeof Text,
  });

  try {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <VStack space="lg">

          
          <Box style={styles.section}>
            <Text size="lg" bold>Usuario</Text>
            <Text mt="$2">
              Nombre: <Text bold>{userName}</Text>
            </Text>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Checkbox Group</Text>
            <CheckboxGroup value={checkedVals} onChange={setCheckedVals}>
                <Checkbox value="apple" size="md">
                  <Checkbox.Indicator />
                  <Checkbox.Label><Text>Apple</Text></Checkbox.Label>
                </Checkbox>
                <Checkbox value="banana" size="md">
                  <Checkbox.Indicator />
                  <Checkbox.Label><Text>Banana</Text></Checkbox.Label>
                </Checkbox>
                <Checkbox value="mango" size="md">
                  <Checkbox.Indicator />
                  <Checkbox.Label><Text>Mango</Text></Checkbox.Label>
                </Checkbox>
            </CheckboxGroup>
            <Text mt="$2">Seleccionados: {checkedVals.join(', ')}</Text>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Radio Group</Text>
            <RadioGroup value={radioVal} onChange={setRadioVal}>
                <Radio value="option1">
                  <Radio.Indicator />
                  <Radio.Label><Text>Opción 1</Text></Radio.Label>
                </Radio>
                <Radio value="option2">
                  <Radio.Indicator />
                  <Radio.Label><Text>Opción 2</Text></Radio.Label>
                </Radio>
            </RadioGroup>
            <Text mt="$2">Seleccionado: {radioVal}</Text>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Select</Text>

            {/* simple in-screen select trigger */}
            <TouchableOpacity style={styles.selectTrigger} onPress={() => setShowSelect(s => !s)}>
              <Text>{selectVal}</Text>
            </TouchableOpacity>

            {/* fallback options list shown in-screen */}
            {showSelect && (
              <View style={styles.optionsOverlay}>
                {['value1', 'value2', 'value3', 'value4'].map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => { setSelectVal(v); setShowSelect(false); }}
                    style={styles.optionItem}
                  >
                    <Text>{v}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text mt="$2">Seleccionado: {selectVal}</Text>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Slider (0-100)</Text>
            <Slider
              minValue={0}
              maxValue={100}
              value={sliderVal}
              onChange={setSliderVal}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text mt="$2">Valor: {sliderVal}</Text>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Switch</Text>
            <Switch value={switchVal} onValueChange={setSwitchVal} />
            <Text mt="$2">{switchVal ? 'Activado' : 'Desactivado'}</Text>
          </Box>

       
          <Box style={styles.section}>
            <Text size="lg" bold>TextArea (FormControl)</Text>
            <FormControl>
              <FormControlLabel>
                <Text>Comentario</Text>
              </FormControlLabel>
              <Textarea>
                <Textarea.Input
                  placeholder="Escribe aquí..."
                  value={textAreaVal}
                  onChangeText={setTextAreaVal}
                  size="md"
                  w="$full"
                  h={100}
                />
              </Textarea>
            </FormControl>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Pressable</Text>
            <Pressable
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
            >
              <Text style={[styles.pressableText, pressed && { color: toolbarColor }]}>
                Click Aquí...
              </Text>
            </Pressable>
          </Box>

          
          <Box style={styles.section}>
            <Text size="lg" bold>Link</Text>
            <Link href="https://gluestack.io" isExternal>
              <HStack alignItems="center" space="sm">
                <Icon as={Ionicons} name="link-outline" size="sm" color={toolbarColor} />
                <Text color={toolbarColor}>Ir a documentación de Gluestack</Text>
              </HStack>
            </Link>
          </Box>

        </VStack>
      </ScrollView>
    );
  } catch (error) {
    console.error('Render error en FormsScreen:', error);
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={{ color: 'red', fontWeight: 'bold' }}>
          Error al renderizar FormsScreen: {error.message}
        </Text>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  section: {
    marginBottom: 18,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  pressableText: { fontSize: 16, padding: 8, fontWeight: '600' },
  selectTrigger: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  optionsOverlay: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
});

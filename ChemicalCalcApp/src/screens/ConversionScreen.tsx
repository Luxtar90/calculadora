import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const ConversionScreen = () => {
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');

  const convertUnits = () => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setResult(`${num * 1000} mg`);
    }
  };

  return (
    <View>
      <Text>Ingrese valor en gramos:</Text>
      <TextInput value={value} onChangeText={setValue} keyboardType="numeric" />
      <Button title="Convertir a mg" onPress={convertUnits} />
      {result && <Text>Resultado: {result}</Text>}
    </View>
  );
};

export default ConversionScreen;

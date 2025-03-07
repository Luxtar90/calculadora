import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const DensityScreen = () => {
  const [mass, setMass] = useState('');
  const [volume, setVolume] = useState('');
  const [density, setDensity] = useState('');

  const calculateDensity = () => {
    const m = parseFloat(mass);
    const v = parseFloat(volume);
    if (!isNaN(m) && !isNaN(v) && v > 0) {
      setDensity((m / v).toFixed(2) + ' g/mL');
    }
  };

  return (
    <View>
      <Text>Ingrese masa (g):</Text>
      <TextInput value={mass} onChangeText={setMass} keyboardType="numeric" />
      <Text>Ingrese volumen (mL):</Text>
      <TextInput value={volume} onChangeText={setVolume} keyboardType="numeric" />
      <Button title="Calcular" onPress={calculateDensity} />
      {density && <Text>Densidad: {density}</Text>}
    </View>
  );
};

export default DensityScreen;

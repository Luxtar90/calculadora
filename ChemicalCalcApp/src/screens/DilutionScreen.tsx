import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const DilutionScreen = () => {
  const [c1, setC1] = useState('');
  const [v1, setV1] = useState('');
  const [c2, setC2] = useState('');
  const [v2, setV2] = useState('');
  const [result, setResult] = useState('');

  const calculateDilution = () => {
    const conc1 = parseFloat(c1);
    const vol1 = parseFloat(v1);
    const conc2 = parseFloat(c2);
    if (!isNaN(conc1) && !isNaN(conc2) && conc1 > 0 && conc2 > 0) {
      const vol2 = (conc1 * vol1) / conc2;
      setResult(`Volumen final: ${vol2.toFixed(2)} mL`);
    }
  };

  return (
    <View>
      <Text>Ingrese C1 (M):</Text>
      <TextInput value={c1} onChangeText={setC1} keyboardType="numeric" />
      <Text>Ingrese V1 (mL):</Text>
      <TextInput value={v1} onChangeText={setV1} keyboardType="numeric" />
      <Text>Ingrese C2 (M):</Text>
      <TextInput value={c2} onChangeText={setC2} keyboardType="numeric" />
      <Button title="Calcular" onPress={calculateDilution} />
      {result && <Text>{result}</Text>}
    </View>
  );
};

export default DilutionScreen;

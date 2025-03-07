import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

const CellCounterScreen = () => {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Conteo de Células: {count}</Text>
      <Button title="Sumar 1" onPress={() => setCount(count + 1)} />
      <Button title="Restar 1" onPress={() => setCount(count > 0 ? count - 1 : 0)} />
      <Button title="Reiniciar" onPress={() => setCount(0)} />
    </View>
  );
};

export default CellCounterScreen;

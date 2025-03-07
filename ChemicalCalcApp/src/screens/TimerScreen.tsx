import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

const TimerScreen = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const startTimer = () => {
    setRunning(true);
    setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setRunning(false);
  };

  return (
    <View>
      <Text>Tiempo: {seconds} s</Text>
      <Button title="Iniciar" onPress={startTimer} disabled={running} />
      <Button title="Detener" onPress={stopTimer} disabled={!running} />
    </View>
  );
};

export default TimerScreen;

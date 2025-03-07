import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CellCounterScreen = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const handleCount = () => {
    Vibration.vibrate(50); // Feedback táctil
    const newCount = count + 1;
    setCount(newCount);
    setHistory([...history, Date.now()]);
  };

  const handleSubtract = () => {
    if (count > 0) {
      setCount(count - 1);
      setHistory(history.slice(0, -1));
    }
  };

  const resetCounter = () => {
    setCount(0);
    setHistory([]);
  };

  // Calcular células por minuto basado en las últimas entradas
  const calculateCPM = () => {
    if (history.length < 2) return 0;
    const recentCounts = history.filter(time => Date.now() - time < 60000);
    return recentCounts.length;
  };

  return (
    <View style={styles.container}>
      <View style={styles.counterCard}>
        <Text style={styles.title}>Contador de Células</Text>
        
        <View style={styles.displayContainer}>
          <Text style={styles.countDisplay}>{count}</Text>
          <Text style={styles.cpmText}>CPM: {calculateCPM()}</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.mainButtonContainer}>
            <TouchableOpacity
              style={styles.mainCountButton}
              onPress={handleCount}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus-circle" size={40} color="white" />
              <Text style={styles.mainButtonText}>Contar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSubtract}
            >
              <MaterialCommunityIcons name="minus-circle" size={30} color="#e74c3c" />
              <Text style={styles.controlButtonText}>Deshacer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={resetCounter}
            >
              <MaterialCommunityIcons name="refresh" size={30} color="#3498db" />
              <Text style={styles.controlButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sesión actual</Text>
            <Text style={styles.statValue}>{history.length} células</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tiempo promedio</Text>
            <Text style={styles.statValue}>
              {history.length > 1 
                ? `${((Date.now() - history[0]) / 1000 / history.length).toFixed(1)}s`
                : '0.0s'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  counterCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 20,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  countDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cpmText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 5,
  },
  gridContainer: {
    marginBottom: 20,
  },
  mainButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCountButton: {
    backgroundColor: '#27ae60',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  controlButton: {
    alignItems: 'center',
    padding: 10,
  },
  controlButtonText: {
    marginTop: 5,
    color: '#7f8c8d',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CellCounterScreen;

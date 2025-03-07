import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ConversionCategory {
  name: string;
  icon: string;
  units: string[];
  conversions: { [key: string]: number };
}

const conversionCategories: ConversionCategory[] = [
  {
    name: "Masa",
    icon: "weight",
    units: ["kg", "g", "mg", "µg", "ng"],
    conversions: {
      "kg": 1000,
      "g": 1,
      "mg": 0.001,
      "µg": 0.000001,
      "ng": 0.000000001
    }
  },
  {
    name: "Volumen",
    icon: "beaker",
    units: ["L", "mL", "µL", "dL", "cm³"],
    conversions: {
      "L": 1000,
      "mL": 1,
      "µL": 0.001,
      "dL": 100,
      "cm³": 1
    }
  },
  {
    name: "Molaridad",
    icon: "flask",
    units: ["M", "mM", "µM", "nM", "pM"],
    conversions: {
      "M": 1,
      "mM": 0.001,
      "µM": 0.000001,
      "nM": 0.000000001,
      "pM": 0.000000000001
    }
  },
  {
    name: "Temperatura",
    icon: "thermometer",
    units: ["°C", "°F", "K"],
    conversions: {
      "°C": 1,
      "°F": 33.8,
      "K": 274.15
    }
  },
  {
    name: "Presión",
    icon: "gauge",
    units: ["atm", "mmHg", "kPa", "bar", "psi"],
    conversions: {
      "atm": 1,
      "mmHg": 760,
      "kPa": 101.325,
      "bar": 1.01325,
      "psi": 14.6959
    }
  },
  {
    name: "Tiempo",
    icon: "clock-outline",
    units: ["h", "min", "s", "ms"],
    conversions: {
      "h": 3600,
      "min": 60,
      "s": 1,
      "ms": 0.001
    }
  }
];

const ConversionScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [fromUnit, setFromUnit] = useState(conversionCategories[0].units[0]);
  const [toUnit, setToUnit] = useState(conversionCategories[0].units[1]);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const formatResult = (value: number, category: string): string => {
    if (Number.isInteger(value)) {
      return value.toString();
    }

    const absValue = Math.abs(value);
    
    if (category === "Temperatura") {
      return Number(value.toFixed(2)).toString();
    }
    
    if (absValue < 0.0001 || absValue > 1000000) {
      return value.toExponential(2);
    }

    let result = '';
    if (absValue < 0.01) {
      result = value.toFixed(4);
    } else if (absValue < 1) {
      result = value.toFixed(3);
    } else if (absValue < 100) {
      result = value.toFixed(2);
    } else {
      result = value.toFixed(1);
    }
    
    return Number(result).toString();
  };

  const superscriptNumber = (num: number): string => {
    const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻'];
    return num.toString()
      .split('')
      .map(char => char === '-' ? superscripts[10] : superscripts[parseInt(char)])
      .join('');
  };

  const convert = (value: string, from: string, to: string) => {
    const category = conversionCategories[selectedCategory];
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return '';
    }

    if (category.name === "Temperatura") {
      let resultValue: number;
      if (from === "°C" && to === "°F") {
        resultValue = (numValue * 9/5) + 32;
      } else if (from === "°F" && to === "°C") {
        resultValue = (numValue - 32) * 5/9;
      } else if (from === "°C" && to === "K") {
        resultValue = numValue + 273.15;
      } else if (from === "K" && to === "°C") {
        resultValue = numValue - 273.15;
      } else if (from === "°F" && to === "K") {
        resultValue = (numValue - 32) * 5/9 + 273.15;
      } else if (from === "K" && to === "°F") {
        resultValue = (numValue - 273.15) * 9/5 + 32;
      } else {
        resultValue = numValue;
      }
      return formatResult(resultValue, category.name);
    } else {
      const fromValue = category.conversions[from];
      const toValue = category.conversions[to];
      const result = (numValue * fromValue) / toValue;
      return formatResult(result, category.name);
    }
  };

  useEffect(() => {
    if (fromValue) {
      const result = convert(fromValue, fromUnit, toUnit);
      setToValue(result);
    } else {
      setToValue('');
    }
  }, [fromValue, fromUnit, toUnit, selectedCategory]);

  const handleCategoryChange = (index: number) => {
    setSelectedCategory(index);
    setFromUnit(conversionCategories[index].units[0]);
    setToUnit(conversionCategories[index].units[1]);
    if (fromValue) {
      const result = convert(fromValue, conversionCategories[index].units[0], conversionCategories[index].units[1]);
      setToValue(result);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {conversionCategories.map((category, index) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryButton,
                selectedCategory === index && styles.selectedCategory
              ]}
              onPress={() => handleCategoryChange(index)}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={24}
                color={selectedCategory === index ? '#fff' : '#2c3e50'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === index && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <View style={styles.conversionGroup}>
          <View style={styles.unitSelector}>
            {conversionCategories[selectedCategory].units.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  fromUnit === unit && styles.selectedUnit
                ]}
                onPress={() => setFromUnit(unit)}
              >
                <Text style={[
                  styles.unitText,
                  fromUnit === unit && styles.selectedUnitText
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={fromValue}
            onChangeText={setFromValue}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.conversionGroup}>
          <View style={styles.unitSelector}>
            {conversionCategories[selectedCategory].units.map(unit => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  toUnit === unit && styles.selectedUnit
                ]}
                onPress={() => setToUnit(unit)}
              >
                <Text style={[
                  styles.unitText,
                  toUnit === unit && styles.selectedUnitText
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.resultText}>
            {toValue}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202124',
  },
  categoriesContainer: {
    backgroundColor: '#202124',
    paddingVertical: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3c4043',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#3c4043',
  },
  selectedCategory: {
    backgroundColor: '#8ab4f8',
  },
  categoryText: {
    marginLeft: 8,
    color: '#e8eaed',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: '#202124',
  },
  card: {
    backgroundColor: '#202124',
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  conversionGroup: {
    marginBottom: 20,
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#3c4043',
  },
  selectedUnit: {
    backgroundColor: '#8ab4f8',
  },
  unitText: {
    color: '#e8eaed',
    fontSize: 14,
  },
  selectedUnitText: {
    color: '#202124',
  },
  input: {
    fontSize: 32,
    color: '#e8eaed',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#3c4043',
  },
  resultText: {
    fontSize: 32,
    color: '#e8eaed',
    padding: 10,
  },
});

export default ConversionScreen;

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Solutions: undefined;
  EnzymeLibrary: undefined;
  Conversion: undefined;
  Timer: undefined;
  CellCounter: undefined;
  Settings: undefined;
};

type NavigationProp = DrawerNavigationProp<RootStackParamList>;

interface FloatingSymbolProps {
  symbol: string;
  style: any;
  key?: number;
}

const FloatingSymbol: React.FC<FloatingSymbolProps> = ({ symbol, style }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text style={[styles.floatingSymbol, style, {
      transform: [{ translateY }],
      opacity,
    }]}>
      {symbol}
    </Animated.Text>
  );
};

const BackgroundSymbols = () => {
  const symbols = ['+', '−', 'H⁺', 'OH⁻', '⚛', '⚗', '◯', '△', '□'];
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.backgroundContainer}>
      {symbols.map((symbol, index) => (
        <FloatingSymbol
          key={index}
          symbol={symbol}
          style={{
            left: Math.random() * screenWidth,
            top: Math.random() * screenHeight,
            transform: [{ rotate: `${Math.random() * 360}deg` }],
          }}
        />
      ))}
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const animatePress = (pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressed ? 0.95 : 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: pressed ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg']
  });

  const menuItems = [
    { 
      name: 'Search', 
      icon: 'calculate', 
      title: 'Calculadora de Masa Molar',
      description: 'Calcula la masa molar de compuestos químicos'
    },
    { 
      name: 'Solutions', 
      icon: 'science', 
      title: 'Cálculo de Soluciones',
      description: 'Concentraciones, diluciones y pureza'
    },
    { 
      name: 'EnzymeLibrary', 
      icon: 'biotech', 
      title: 'Biblioteca de Enzimas',
      description: 'Información sobre enzimas comunes'
    },
    { 
      name: 'Conversion', 
      icon: 'compare-arrows', 
      title: 'Conversiones',
      description: 'Conversión entre unidades'
    },
    { 
      name: 'Timer', 
      icon: 'timer', 
      title: 'Temporizador',
      description: 'Control de tiempo para experimentos'
    },
    { 
      name: 'CellCounter', 
      icon: 'grid-on', 
      title: 'Contador de Células',
      description: 'Conteo de células en laboratorio'
    },
    { 
      name: 'Settings', 
      icon: 'settings', 
      title: 'Configuración',
      description: 'Ajustes de la aplicación'
    },
  ] as const;

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <BackgroundSymbols />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: colors.primary }]}>AstroLab</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Laboratorio Digital</Text>
            <Icon name="science" size={24} color={colors.primary} style={styles.titleIcon} />
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Herramientas avanzadas para química y biotecnología
          </Text>
        </View>
        
        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.cardWrapper]}
              onPressIn={() => animatePress(true)}
              onPressOut={() => animatePress(false)}
              onPress={() => navigation.navigate(item.name)}
            >
              <Animated.View
                style={[
                  styles.card,
                  { 
                    backgroundColor: colors.card,
                    transform: [
                      { scale: scaleAnim },
                      { rotate: spin }
                    ]
                  }
                ]}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name={item.icon} size={32} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                  {item.description}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingSymbol: {
    position: 'absolute',
    fontSize: 24,
    color: 'rgba(100, 100, 100, 0.1)',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    marginLeft: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 20,
    aspectRatio: 0.8,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 6,
    lineHeight: 16,
    flexGrow: 0,
  },
});

export default HomeScreen;

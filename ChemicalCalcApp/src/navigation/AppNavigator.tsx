import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerScreenProps } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme, lightTheme, darkTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import SolutionsScreen from '../screens/SolutionsScreen';
import EnzymeLibraryScreen from '../screens/EnzymeLibraryScreen';
import ConversionScreen from '../screens/ConversionScreen';
import TimerScreen from '../screens/TimerScreen';
import CellCounterScreen from '../screens/CellCounterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RouteProp } from '@react-navigation/native';

// Define el tipo de parámetros para Solutions
type SolutionsParams = {
  params?: {
    molarMass?: number;
    equivalents?: number;
    equivalentWeight?: number;
    compoundType?: string;
  };
};

// Define el tipo de lista de parámetros
export type AppParamList = {
  Home: undefined;
  Search: undefined;
  Solutions: SolutionsParams;
  EnzymeLibrary: undefined;
  Conversion: undefined;
  Timer: undefined;
  CellCounter: undefined;
  Settings: undefined;
};

// Usa el tipo de lista de parámetros en el Drawer.Navigator
const Drawer = createDrawerNavigator<AppParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background, 
      paddingTop: 40 
    }}>
      {props.state.routes.map((route: any, index: number) => (
        <TouchableOpacity
          key={route.key}
          style={{
            padding: 15,
            backgroundColor: props.state.index === index ? colors.card : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
            borderRadius: 8,
          }}
          onPress={() => props.navigation.navigate(route.name)}
        >
          <Icon
            name={getIconName(route.name)}
            size={24}
            color={props.state.index === index ? colors.primary : colors.text}
          />
          <Text
            style={{
              color: props.state.index === index ? colors.primary : colors.text,
              marginLeft: 15,
              fontSize: 16,
            }}
          >
            {getScreenTitle(route.name)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const getScreenTitle = (routeName: string) => {
  switch (routeName) {
    case 'Home':
      return 'Inicio';
    case 'Search':
      return 'Calculadora de Masa Molar';
    case 'Solutions':
      return 'Cálculo de Soluciones';
    case 'EnzymeLibrary':
      return 'Biblioteca de Enzimas';
    case 'Conversion':
      return 'Conversiones';
    case 'Timer':
      return 'Temporizador';
    case 'CellCounter':
      return 'Contador de Células';
    case 'Settings':
      return 'Configuración';
    default:
      return routeName;
  }
};

const getIconName = (routeName: string) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Search':
      return 'calculate';
    case 'Solutions':
      return 'science';
    case 'EnzymeLibrary':
      return 'biotech';
    case 'Conversion':
      return 'compare-arrows';
    case 'Timer':
      return 'timer';
    case 'CellCounter':
      return 'grid-on';
    case 'Settings':
      return 'settings';
    default:
      return 'circle';
  }
};

interface IconProps {
  color: string;
  size: number;
}

const AppNavigator = () => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: colors.card,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          drawerIcon: ({ color }: IconProps) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Calculadora de Masa Molar',
          drawerIcon: ({ color }: IconProps) => <Icon name="calculate" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Solutions"
        component={SolutionsScreen}
        options={{
          title: 'Cálculo de Soluciones',
          drawerIcon: ({ color }: IconProps) => <Icon name="science" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="EnzymeLibrary"
        component={EnzymeLibraryScreen}
        options={{
          title: 'Biblioteca de Enzimas',
          drawerIcon: ({ color }: IconProps) => <Icon name="biotech" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Conversion"
        component={ConversionScreen}
        options={{
          title: 'Conversiones',
          drawerIcon: ({ color }: IconProps) => <Icon name="compare-arrows" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          title: 'Temporizador',
          drawerIcon: ({ color }: IconProps) => <Icon name="timer" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="CellCounter"
        component={CellCounterScreen}
        options={{
          title: 'Contador de Células',
          drawerIcon: ({ color }: IconProps) => <Icon name="grid-on" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          drawerIcon: ({ color }: IconProps) => <Icon name="settings" size={24} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

export default AppNavigator;

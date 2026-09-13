import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HelperRegisterScreen from './screens/HelperRegisterScreen';

import CustomerHomeScreen from './screens/CustomerHomeScreen';
import SearchScreen from './screens/SearchScreen';
import HelperDetailsScreen from './screens/HelperDetailsScreen';

import HelperHomeScreen from './screens/HelperHomeScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >

        {/* Login */}

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />


        {/* Customer Registration */}

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />


        {/* Helper Registration */}

        <Stack.Screen
          name="HelperRegister"
          component={HelperRegisterScreen}
        />


        {/* Customer */}

        <Stack.Screen
          name="CustomerHome"
          component={CustomerHomeScreen}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
        />

        <Stack.Screen
          name="HelperDetails"
          component={HelperDetailsScreen}
        />


        {/* Helper */}

        <Stack.Screen
          name="HelperHome"
          component={HelperHomeScreen}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}
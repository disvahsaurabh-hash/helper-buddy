import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {

    if (!email || !password) {

      Alert.alert(
        'Missing Information',
        'Please enter email and password.'
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        'https://helper-buddy.onrender.com/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data = await response.json();

      console.log('Login response:', data);


      if (!response.ok) {

        Alert.alert(
          'Login Failed',
          data.message || 'Invalid email or password.'
        );

        return;
      }


      const token = data.token;
      const user = data.user;


      console.log('Token:', token);
      console.log('User:', user);


      if (user.role === 'customer') {

        Alert.alert(
          'Welcome! 👋',
          `Hello ${user.name}`
        );

        navigation.replace('CustomerHome', {
          user: user,
          token: token,
        });

      }

      else if (user.role === 'helper') {

        Alert.alert(
          'Welcome Helper! 🛠️',
          `Hello ${user.name}`
        );

        navigation.replace('HelperHome', {
          user: user,
          token: token,
        });

      }

      else {

        Alert.alert(
          'Error',
          'Unknown user role.'
        );

      }


    } catch (error) {

      console.log(
        'Login Error:',
        error
      );


      Alert.alert(
        'Connection Error',
        'Could not connect to LocalHelper server.'
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >

      {/* Logo */}

      <Text style={styles.logo}>
        LocalHelper
      </Text>


      <Text style={styles.tagline}>
        Right Help. Right Now.
      </Text>


      <Text style={styles.heading}>
        Welcome Back 👋
      </Text>


      {/* Email */}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />


      {/* Password */}

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />


      {/* Login */}

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >

        {loading ? (

          <ActivityIndicator color="#fff" />

        ) : (

          <Text style={styles.loginButtonText}>
            Login
          </Text>

        )}

      </TouchableOpacity>


      {/* Customer Registration */}

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() =>
          navigation.navigate('Register')
        }
      >

        <Text style={styles.registerText}>
          Don't have a customer account?{' '}

          <Text style={styles.registerLink}>
            Register
          </Text>
        </Text>

      </TouchableOpacity>


      {/* Divider */}

      <View style={styles.dividerContainer}>

        <View style={styles.dividerLine} />

        <Text style={styles.orText}>
          OR
        </Text>

        <View style={styles.dividerLine} />

      </View>


      {/* Helper Registration */}

      <TouchableOpacity
        style={styles.helperButton}
        onPress={() =>
          navigation.navigate('HelperRegister')
        }
      >

        <Text style={styles.helperButtonText}>
          🛠️ Become a Helper
        </Text>

      </TouchableOpacity>


      <Text style={styles.helperDescription}>
        Join LocalHelper and offer your services
        to customers in your city.
      </Text>


    </ScrollView>

  );
}


const styles = StyleSheet.create({

  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },


  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },


  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007BFF',
  },


  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 45,
    color: '#666',
  },


  heading: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#222',
  },


  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },


  loginButton: {
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    marginTop: 10,
  },


  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },


  registerButton: {
    marginTop: 25,
    alignItems: 'center',
  },


  registerText: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
  },


  registerLink: {
    fontWeight: 'bold',
    color: '#007BFF',
  },


  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },


  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },


  orText: {
    marginHorizontal: 12,
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },


  helperButton: {
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007BFF',
    backgroundColor: '#fff',
  },


  helperButtonText: {
    color: '#007BFF',
    fontSize: 17,
    fontWeight: 'bold',
  },


  helperDescription: {
    textAlign: 'center',
    color: '#777',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },

});
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

export default function CustomerHomeScreen({ navigation, route }) {

  const { user, token } = route.params || {};

  const [city, setCity] = useState('');

  const openSearch = (profession = '') => {

    navigation.navigate('Search', {
      profession,
      city,
      user,
      token,
    });

  };

  // ================================
  // BECOME A HELPER
  // ================================

  const becomeHelper = () => {

    if (!user) {
      navigation.replace('Login');
      return;
    }

    navigation.navigate('HelperRegister', {
      user: user,
      token: token,
    });

  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}

      <View style={styles.header}>

        <View>

          <Text style={styles.welcome}>
            Welcome back 👋
          </Text>

          <Text style={styles.name}>
            {user?.name || 'Customer'}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate('Profile', {
              user,
              token,
            })
          }
        >

          <Text style={styles.profileIcon}>
            👤
          </Text>

        </TouchableOpacity>

      </View>


      {/* ============================= */}
      {/* BECOME A HELPER */}
      {/* ============================= */}

      <TouchableOpacity
        style={styles.helperBanner}
        onPress={becomeHelper}
      >

        <View style={styles.helperBannerIcon}>
          <Text style={styles.helperEmoji}>
            🛠️
          </Text>
        </View>

        <View style={styles.helperBannerContent}>

          <Text style={styles.helperBannerTitle}>
            Become a Helper
          </Text>

          <Text style={styles.helperBannerText}>
            Offer your services and earn money
          </Text>

        </View>

        <Text style={styles.helperArrow}>
          ›
        </Text>

      </TouchableOpacity>


      {/* ============================= */}
      {/* SEARCH CARD */}
      {/* ============================= */}

      <View style={styles.searchCard}>

        <Text style={styles.searchTitle}>
          Find a Local Helper 🔎
        </Text>

        <Text style={styles.searchDescription}>
          Find trusted professionals near you
        </Text>


        <TextInput
          style={styles.cityInput}
          placeholder="Enter your city"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
        />


        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => openSearch()}
        >

          <Text style={styles.searchButtonText}>
            Search Helpers
          </Text>

        </TouchableOpacity>

      </View>


      {/* ============================= */}
      {/* POPULAR SERVICES */}
      {/* ============================= */}

      <Text style={styles.sectionTitle}>
        Popular Services
      </Text>


      <View style={styles.categories}>

        <TouchableOpacity
          style={styles.category}
          onPress={() => openSearch('Plumber')}
        >

          <Text style={styles.categoryIcon}>
            🔧
          </Text>

          <Text style={styles.categoryText}>
            Plumber
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.category}
          onPress={() => openSearch('Electrician')}
        >

          <Text style={styles.categoryIcon}>
            ⚡
          </Text>

          <Text style={styles.categoryText}>
            Electrician
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.category}
          onPress={() => openSearch('Carpenter')}
        >

          <Text style={styles.categoryIcon}>
            🪚
          </Text>

          <Text style={styles.categoryText}>
            Carpenter
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.category}
          onPress={() => openSearch('Painter')}
        >

          <Text style={styles.categoryIcon}>
            🎨
          </Text>

          <Text style={styles.categoryText}>
            Painter
          </Text>

        </TouchableOpacity>

      </View>


      {/* ============================= */}
      {/* BROWSE ALL */}
      {/* ============================= */}

      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => openSearch()}
      >

        <Text style={styles.browseText}>
          Browse All Helpers →
        </Text>

      </TouchableOpacity>


      {/* ============================= */}
      {/* HOW IT WORKS */}
      {/* ============================= */}

      <Text style={styles.sectionTitle}>
        How LocalHelper Works
      </Text>


      <View style={styles.stepCard}>

        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            1
          </Text>
        </View>

        <View style={styles.stepContent}>

          <Text style={styles.stepTitle}>
            Search
          </Text>

          <Text style={styles.stepText}>
            Find helpers by profession and city.
          </Text>

        </View>

      </View>


      <View style={styles.stepCard}>

        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            2
          </Text>
        </View>

        <View style={styles.stepContent}>

          <Text style={styles.stepTitle}>
            Choose
          </Text>

          <Text style={styles.stepText}>
            View profiles and choose the right helper.
          </Text>

        </View>

      </View>


      <View style={styles.stepCard}>

        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>
            3
          </Text>
        </View>

        <View style={styles.stepContent}>

          <Text style={styles.stepTitle}>
            Get Help
          </Text>

          <Text style={styles.stepText}>
            Contact your selected local helper.
          </Text>

        </View>

      </View>


      <View style={{ height: 40 }} />

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 55,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 16,
    color: '#666',
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },

  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 24,
  },

  // ================================
  // BECOME HELPER
  // ================================

  helperBanner: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  helperBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eaf3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  helperEmoji: {
    fontSize: 25,
  },

  helperBannerContent: {
    flex: 1,
    marginLeft: 13,
  },

  helperBannerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },

  helperBannerText: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },

  helperArrow: {
    fontSize: 30,
    color: '#999',
  },

  // ================================
  // SEARCH
  // ================================

  searchCard: {
    backgroundColor: '#007BFF',
    borderRadius: 18,
    padding: 22,
    elevation: 3,
  },

  searchTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  searchDescription: {
    color: '#eaf3ff',
    marginTop: 8,
    fontSize: 14,
  },

  cityInput: {
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginTop: 18,
    fontSize: 15,
  },

  searchButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  searchButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ================================
  // SECTIONS
  // ================================

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 15,
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  category: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  categoryIcon: {
    fontSize: 32,
  },

  categoryText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '600',
  },

  browseButton: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginTop: 5,
  },

  browseText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ================================
  // HOW IT WORKS
  // ================================

  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  stepContent: {
    flex: 1,
    marginLeft: 15,
  },

  stepTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  stepText: {
    color: '#777',
    marginTop: 4,
    fontSize: 13,
  },

});
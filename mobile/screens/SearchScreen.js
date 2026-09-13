import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function SearchScreen({ navigation, route }) {

  const {
    user,
    token,
    profession: initialProfession,
    city: initialCity,
  } = route.params || {};

  const [profession, setProfession] = useState(
    initialProfession || ''
  );

  const [city, setCity] = useState(
    initialCity || ''
  );

  const [helpers, setHelpers] = useState([]);

  const [loading, setLoading] = useState(false);

  const searchHelpers = async () => {

    setLoading(true);

    try {

     let url = 'https://helper-buddy.onrender.com/api/helpers/search';

      const params = [];

      if (profession.trim()) {

        params.push(
          `profession=${encodeURIComponent(
            profession.trim()
          )}`
        );

      }

      if (city.trim()) {

        params.push(
          `city=${encodeURIComponent(
            city.trim()
          )}`
        );

      }

      if (params.length > 0) {

        url += '?' + params.join('&');

      }

      console.log('Searching:', url);

      const response = await fetch(url);

      const data = await response.json();

      console.log('Search result:', data);

      if (!response.ok) {

        Alert.alert(
          'Search Error',
          data.message || 'Could not search helpers.'
        );

        return;
      }

      setHelpers(data);

    } catch (error) {

      console.log('Search error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to LocalHelper server.'
      );

    } finally {

      setLoading(false);

    }

  };


  // Automatically search when coming
  // from a service category

  useEffect(() => {

    if (initialProfession || initialCity) {
      searchHelpers();
    }

  }, []);


  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >

          <Text style={styles.back}>
            ‹
          </Text>

        </TouchableOpacity>

        <Text style={styles.title}>
          Find a Helper
        </Text>

        <View style={{ width: 30 }} />

      </View>


      {/* Search Form */}

      <View style={styles.searchCard}>

        <Text style={styles.label}>
          What service do you need?
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Plumber"
          placeholderTextColor="#888"
          value={profession}
          onChangeText={setProfession}
        />


        <Text style={styles.label}>
          City
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: Mumbai"
          placeholderTextColor="#888"
          value={city}
          onChangeText={setCity}
        />


        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchHelpers}
          disabled={loading}
        >

          {loading ? (

            <ActivityIndicator color="#fff" />

          ) : (

            <Text style={styles.searchButtonText}>
              🔎 Search Helpers
            </Text>

          )}

        </TouchableOpacity>

      </View>


      {/* Results */}

      <Text style={styles.resultsTitle}>

        {helpers.length > 0
          ? `${helpers.length} Helper${
              helpers.length > 1 ? 's' : ''
            } Found`
          : 'Available Helpers'}

      </Text>


      {loading ? (

        <View style={styles.loading}>

          <ActivityIndicator
            size="large"
            color="#007BFF"
          />

          <Text style={styles.loadingText}>
            Finding helpers...
          </Text>

        </View>

      ) : helpers.length === 0 ? (

        <View style={styles.empty}>

          <Text style={styles.emptyIcon}>
            🔎
          </Text>

          <Text style={styles.emptyTitle}>
            No helpers found
          </Text>

          <Text style={styles.emptyText}>
            Try another profession or city.
          </Text>

        </View>

      ) : (

        helpers.map((helper) => (

          <TouchableOpacity
            key={helper._id}
            style={styles.helperCard}
            onPress={() =>
              navigation.navigate(
                'HelperDetails',
                {
                  helperId: helper._id,
                  user,
                  token,
                }
              )
            }
          >

            {/* Avatar */}

            <View style={styles.avatar}>

              <Text style={styles.avatarText}>

                {helper.name
                  ? helper.name
                      .charAt(0)
                      .toUpperCase()
                  : 'H'}

              </Text>

            </View>


            {/* Helper Information */}

            <View style={styles.helperInfo}>

              <Text style={styles.helperName}>
                {helper.name || 'Helper'}
              </Text>


              <Text style={styles.profession}>
                🛠️ {helper.profession || 'Service Provider'}
              </Text>


              <Text style={styles.city}>
                📍 {helper.city || 'Location unavailable'}
              </Text>


              {helper.experience ? (

                <Text style={styles.experience}>
                  💼 {helper.experience} years experience
                </Text>

              ) : null}

            </View>


            <Text style={styles.arrow}>
              ›
            </Text>

          </TouchableOpacity>

        ))

      )}


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
    marginTop: 45,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  back: {
    fontSize: 40,
    color: '#222',
    lineHeight: 40,
  },

  title: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    marginTop: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
    color: '#444',
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
    backgroundColor: '#fafafa',
    fontSize: 15,
  },

  searchButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 14,
  },

  loading: {
    alignItems: 'center',
    marginTop: 40,
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
  },

  empty: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginTop: 5,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },

  emptyText: {
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },

  helperCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  helperInfo: {
    flex: 1,
    marginLeft: 14,
  },

  helperName: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  profession: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },

  city: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },

  experience: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  arrow: {
    fontSize: 30,
    color: '#999',
  },

});
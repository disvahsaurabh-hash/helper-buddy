import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function HelperDetailsScreen({ navigation, route }) {

  const { helperId, user, token } = route.params || {};

  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelper();
  }, []);

  const fetchHelper = async () => {

    if (!helperId) {
      setLoading(false);

      Alert.alert(
        'Error',
        'Helper information not found.'
      );

      return;
    }

    try {

      const response = await fetch(
        `https://helper-buddy.onrender.com/api/helpers/${helperId}`
      );

      const data = await response.json();

      console.log('Helper details:', data);

      if (!response.ok) {

        Alert.alert(
          'Error',
          data.message || 'Could not load helper.'
        );

        return;
      }

      setHelper(data);

    } catch (error) {

      console.log('Helper details error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to LocalHelper server.'
      );

    } finally {

      setLoading(false);

    }
  };


  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#007BFF"
        />

        <Text style={styles.loadingText}>
          Loading helper...
        </Text>

      </View>
    );
  }


  if (!helper) {

    return (
      <View style={styles.loadingContainer}>

        <Text style={styles.errorText}>
          Helper not found.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >

          <Text style={styles.backButtonText}>
            Go Back
          </Text>

        </TouchableOpacity>

      </View>
    );
  }


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
          Helper Profile
        </Text>

        <View style={{ width: 30 }} />

      </View>


      {/* Profile */}

      <View style={styles.profileCard}>

        <View style={styles.avatar}>

          <Text style={styles.avatarText}>
            {helper.name
              ? helper.name.charAt(0).toUpperCase()
              : 'H'}
          </Text>

        </View>


        <Text style={styles.name}>
          {helper.name || 'Helper'}
        </Text>


        <Text style={styles.profession}>
          🛠️ {helper.profession || 'Service Provider'}
        </Text>


        <Text style={styles.city}>
          📍 {helper.city || 'Location unavailable'}
        </Text>

      </View>


      {/* Information */}

      <Text style={styles.sectionTitle}>
        About Helper
      </Text>


      <View style={styles.infoCard}>

        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Profession
          </Text>

          <Text style={styles.infoValue}>
            {helper.profession || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            City
          </Text>

          <Text style={styles.infoValue}>
            {helper.city || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Experience
          </Text>

          <Text style={styles.infoValue}>
            {helper.experience
              ? `${helper.experience} years`
              : '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Phone
          </Text>

          <Text style={styles.infoValue}>
            {helper.phone || '-'}
          </Text>

        </View>

      </View>


      {/* Description */}

      <Text style={styles.sectionTitle}>
        Description
      </Text>


      <View style={styles.descriptionCard}>

        <Text style={styles.description}>
          {helper.description ||
            'No description provided by this helper.'}
        </Text>

      </View>


      {/* Contact */}

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => {

          if (!helper.phone) {

            Alert.alert(
              'Phone Number Not Available',
              'This helper has not provided a phone number.'
            );

            return;
          }

          Alert.alert(
            'Contact Helper',
            `Phone: ${helper.phone}`
          );

        }}
      >

        <Text style={styles.contactButtonText}>
          📞 Contact Helper
        </Text>

      </TouchableOpacity>


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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    padding: 20,
  },

  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },

  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 15,
  },

  profession: {
    fontSize: 15,
    color: '#555',
    marginTop: 7,
  },

  city: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 15,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    elevation: 2,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },

  infoLabel: {
    color: '#777',
    fontSize: 14,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },

  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    elevation: 2,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#555',
  },

  contactButton: {
    height: 55,
    borderRadius: 12,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  contactButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  backButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
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

export default function HelperHomeScreen({ navigation, route }) {

  const { user, token } = route.params || {};

  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelperProfile();
  }, []);

  const fetchHelperProfile = async () => {

    if (!user?.id) {
      setLoading(false);

      Alert.alert(
        'Error',
        'User information not found. Please login again.'
      );

      return;
    }

    try {

     const response = await fetch(
  `https://helper-buddy.onrender.com/api/helpers/user/${user.id}`
);

      const data = await response.json();

      console.log('Helper profile:', data);

      if (!response.ok) {

        Alert.alert(
          'Profile Error',
          data.message || 'Helper profile not found.'
        );

        return;
      }

      setHelper(data);

    } catch (error) {

      console.log('Helper Profile Error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to LocalHelper server.'
      );

    } finally {

      setLoading(false);

    }
  };


  const handleLogout = () => {

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );

  };


  if (loading) {

    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#007BFF"
        />

        <Text style={styles.loadingText}>
          Loading your profile...
        </Text>

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

        <View>

          <Text style={styles.welcome}>
            Welcome back 👋
          </Text>

          <Text style={styles.name}>
            {helper?.name || user?.name || 'Helper'}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() =>
            navigation.navigate('Profile', {
              user,
              token,
              helper,
            })
          }
        >

          <Text style={styles.profileIcon}>
            👤
          </Text>

        </TouchableOpacity>

      </View>


      {/* Profession */}

      <View style={styles.professionCard}>

        <Text style={styles.professionIcon}>
          🛠️
        </Text>

        <View style={{ flex: 1 }}>

          <Text style={styles.professionTitle}>
            {helper?.profession || 'Helper'}
          </Text>

          <Text style={styles.city}>
            📍 {helper?.city || 'Location not available'}
          </Text>

        </View>

      </View>


      {/* Availability */}

      <View style={styles.statusCard}>

        <View>

          <Text style={styles.statusTitle}>
            Availability
          </Text>

          <Text style={styles.statusText}>
            You are currently available
          </Text>

        </View>

        <View style={styles.onlineDot} />

      </View>


      {/* Overview */}

      <Text style={styles.sectionTitle}>
        Overview
      </Text>


      <View style={styles.statsRow}>

        <View style={styles.statCard}>

          <Text style={styles.statIcon}>
            📋
          </Text>

          <Text style={styles.statNumber}>
            0
          </Text>

          <Text style={styles.statLabel}>
            Requests
          </Text>

        </View>


        <View style={styles.statCard}>

          <Text style={styles.statIcon}>
            📅
          </Text>

          <Text style={styles.statNumber}>
            0
          </Text>

          <Text style={styles.statLabel}>
            Bookings
          </Text>

        </View>


        <View style={styles.statCard}>

          <Text style={styles.statIcon}>
            ⭐
          </Text>

          <Text style={styles.statNumber}>
            0.0
          </Text>

          <Text style={styles.statLabel}>
            Rating
          </Text>

        </View>

      </View>


      {/* My Information */}

      <Text style={styles.sectionTitle}>
        My Information
      </Text>


      <View style={styles.infoCard}>

        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Name
          </Text>

          <Text style={styles.infoValue}>
            {helper?.name || user?.name || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Profession
          </Text>

          <Text style={styles.infoValue}>
            {helper?.profession || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            City
          </Text>

          <Text style={styles.infoValue}>
            {helper?.city || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Phone
          </Text>

          <Text style={styles.infoValue}>
            {helper?.phone || '-'}
          </Text>

        </View>


        <View style={styles.divider} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Experience
          </Text>

          <Text style={styles.infoValue}>
            {helper?.experience
              ? `${helper.experience} years`
              : '-'}
          </Text>

        </View>

      </View>


      {/* Description */}

      <Text style={styles.sectionTitle}>
        About My Services
      </Text>

      <View style={styles.descriptionCard}>

        <Text style={styles.description}>
          {helper?.description ||
            'No service description added yet.'}
        </Text>

      </View>


      {/* Quick Actions */}

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>


      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          navigation.navigate('Profile', {
            user,
            token,
            helper,
          })
        }
      >

        <Text style={styles.actionIcon}>
          👤
        </Text>

        <View style={styles.actionContent}>

          <Text style={styles.actionTitle}>
            My Profile
          </Text>

          <Text style={styles.actionDescription}>
            View and update your helper profile
          </Text>

        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Service requests will be available in the next update.'
          );
        }}
      >

        <Text style={styles.actionIcon}>
          📋
        </Text>

        <View style={styles.actionContent}>

          <Text style={styles.actionTitle}>
            Service Requests
          </Text>

          <Text style={styles.actionDescription}>
            Check requests from customers
          </Text>

        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>


      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => {
          Alert.alert(
            'Coming Soon',
            'Bookings will be available in the next update.'
          );
        }}
      >

        <Text style={styles.actionIcon}>
          📅
        </Text>

        <View style={styles.actionContent}>

          <Text style={styles.actionTitle}>
            My Bookings
          </Text>

          <Text style={styles.actionDescription}>
            View your upcoming bookings
          </Text>

        </View>

        <Text style={styles.arrow}>
          ›
        </Text>

      </TouchableOpacity>


      {/* Logout */}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >

        <Text style={styles.logoutText}>
          Logout
        </Text>

      </TouchableOpacity>


      <View style={{ height: 30 }} />

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
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
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

  professionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },

  professionIcon: {
    fontSize: 30,
    marginRight: 15,
  },

  professionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  city: {
    marginTop: 5,
    color: '#666',
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  statusText: {
    marginTop: 5,
    color: '#666',
  },

  onlineDot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#22c55e',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 15,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statCard: {
    backgroundColor: '#fff',
    width: '31%',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
  },

  statIcon: {
    fontSize: 23,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 7,
  },

  statLabel: {
    color: '#777',
    marginTop: 4,
    fontSize: 12,
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
    paddingVertical: 5,
  },

  infoLabel: {
    color: '#777',
    fontSize: 14,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '55%',
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
    color: '#555',
    fontSize: 15,
    lineHeight: 22,
  },

  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  actionIcon: {
    fontSize: 28,
    width: 45,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  actionDescription: {
    color: '#777',
    marginTop: 4,
    fontSize: 13,
  },

  arrow: {
    fontSize: 30,
    color: '#999',
  },

  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 40,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d11a2a',
  },

});
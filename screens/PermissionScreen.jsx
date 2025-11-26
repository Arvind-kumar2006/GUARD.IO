import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';

const PermissionScreen = ({ navigation }) => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const handleLocationPermission = () => {
    // Handle location permission request
    console.log('Requesting location permission');
    setLocationGranted(true);
    // In real app: request actual permission using expo-location
  };

  const handleNotificationPermission = () => {
    // Handle notification permission request
    console.log('Requesting notification permission');
    setNotificationsGranted(true);
    // In real app: request actual permission using expo-notifications
  };

  const handleContinue = () => {
    if (locationGranted && notificationsGranted) {
      // Navigate to home or next screen
      console.log('All permissions granted');
      // navigation.navigate('Home');
    }
  };

  return (
    <LinearGradient
      colors={['#E6F7FF', '#F8FFF8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header 
            showBack 
            onBackPress={() => navigation.goBack()}
          />

          <View style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Your Safety Matters</Text>
              <Text style={styles.subtitle}>
                To provide the best protection, we need a few permissions
              </Text>
            </View>

            <View style={styles.permissionsContainer}>
              {/* Location Permission Card */}
              <View style={styles.permissionCard}>
                <View style={styles.permissionHeader}>
                  <View style={[styles.permissionIconContainer, styles.locationIconContainer]}>
                    <Ionicons name="location" size={28} color="#1DA1F2" />
                  </View>
                  <View style={styles.permissionTextContainer}>
                    <Text style={styles.permissionTitle}>Location Access</Text>
                    <Text style={styles.permissionDescription}>
                      Always-on access for real-time tracking
                    </Text>
                  </View>
                </View>
                <CustomButton
                  title={locationGranted ? "Location Enabled" : "Allow Location"}
                  onPress={handleLocationPermission}
                  variant="primary"
                  disabled={locationGranted}
                  style={styles.permissionButton}
                />
              </View>

              {/* Notification Permission Card */}
              <View style={styles.permissionCard}>
                <View style={styles.permissionHeader}>
                  <View style={[styles.permissionIconContainer, styles.notificationIconContainer]}>
                    <Ionicons name="notifications" size={28} color="#FF8C00" />
                  </View>
                  <View style={styles.permissionTextContainer}>
                    <Text style={styles.permissionTitle}>Notification Access</Text>
                    <Text style={styles.permissionDescription}>
                      Receive urgent SOS alerts and updates
                    </Text>
                  </View>
                </View>
                <CustomButton
                  title={notificationsGranted ? "Notifications Enabled" : "Enable Notifications"}
                  onPress={handleNotificationPermission}
                  variant="orange"
                  disabled={notificationsGranted}
                  style={styles.permissionButton}
                />
              </View>
            </View>

            <CustomButton
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              disabled={!locationGranted || !notificationsGranted}
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  permissionsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  permissionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationIconContainer: {
    backgroundColor: '#E7F1FF',
  },
  notificationIconContainer: {
    backgroundColor: '#FFF4E6',
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  permissionButton: {
    width: '100%',
  },
  continueButton: {
    marginTop: 8,
  },
});

export default PermissionScreen;


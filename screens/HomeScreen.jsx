import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#E7F1FF', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header 
            logo 
            rightIcon="menu"
            onRightIconPress={() => console.log('Menu pressed')}
          />

          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Your Safety Hub</Text>
              <Text style={styles.welcomeSubtext}>
                Choose an option to get started
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              {/* Start Sharing Button */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('Permission')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, styles.sharingIconContainer]}>
                  <Ionicons name="location" size={32} color="#1DA1F2" />
                </View>
                <Text style={styles.actionTitle}>Start Sharing</Text>
                <Text style={styles.actionSubtitle}>
                  Share your live location with trusted contacts
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="#1DA1F2" />
                </View>
              </TouchableOpacity>

              {/* SOS Button */}
              <TouchableOpacity
                style={[styles.actionCard, styles.sosCard]}
                onPress={() => console.log('SOS pressed')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, styles.sosIconContainer]}>
                  <Ionicons name="alert-circle" size={32} color="#FF5A46" />
                </View>
                <Text style={[styles.actionTitle, styles.sosTitle]}>SOS</Text>
                <Text style={styles.actionSubtitle}>
                  Send emergency alert to your contacts
                </Text>
                <View style={[styles.cardButton, styles.sosCardButton]}>
                  <Text style={[styles.cardButtonText, styles.sosCardButtonText]}>
                    Activate SOS
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FF5A46" />
                </View>
              </TouchableOpacity>

              {/* Contacts Button */}
              <TouchableOpacity
                style={[styles.actionCard, styles.contactsCard]}
                onPress={() => console.log('Contacts pressed')}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, styles.contactsIconContainer]}>
                  <Ionicons name="people" size={32} color="#1DA1F2" />
                </View>
                <Text style={styles.actionTitle}>Contacts</Text>
                <Text style={styles.actionSubtitle}>
                  Manage your emergency contacts
                </Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>View Contacts</Text>
                  <Ionicons name="arrow-forward" size={20} color="#1DA1F2" />
                </View>
              </TouchableOpacity>
            </View>
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
  welcomeSection: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 20,
  },
  actionCard: {
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
  sosCard: {
    borderColor: '#FFE5E3',
  },
  contactsCard: {
    borderColor: '#E3F2FD',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#E7F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sharingIconContainer: {
    backgroundColor: '#E7F1FF',
  },
  sosIconContainer: {
    backgroundColor: '#FFE5E3',
  },
  contactsIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sosTitle: {
    color: '#FF5A46',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F0F8FF',
  },
  sosCardButton: {
    backgroundColor: '#FFF0EF',
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DA1F2',
    marginRight: 8,
  },
  sosCardButtonText: {
    color: '#FF5A46',
  },
});

export default HomeScreen;


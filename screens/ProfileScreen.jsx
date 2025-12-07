import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
      const { logout, user } = useAuth();
      const [displayName, setDisplayName] = useState(user?.displayName || 'User');

      useEffect(() => {
            // Fetch latest name from Firestore just in case
            const fetchName = async () => {
                  if (user?.uid) {
                        const docSnap = await getDoc(doc(db, 'users', user.uid));
                        if (docSnap.exists() && docSnap.data().displayName) {
                              setDisplayName(docSnap.data().displayName);
                        }
                  }
            };
            fetchName();
      }, [user]);

      const handleLogout = () => {
            Alert.alert("Log Out", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Log Out", style: "destructive", onPress: logout }
            ]);
      };

      return (
            <SafeAreaView style={styles.container}>
                  <Text style={styles.title}>Profile</Text>

                  <View style={styles.card}>
                        <View style={styles.avatarContainer}>
                              <Ionicons name="person" size={50} color="#1DA1F2" />
                        </View>
                        <Text style={styles.name}>{displayName}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                  </View>

                  <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Contacts')}
                  >
                        <Ionicons name="people-outline" size={20} color="#333" style={{ marginRight: 10 }} />
                        <Text style={styles.buttonText}>Emergency Contacts</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>

                  <TouchableOpacity
                        style={[styles.button, styles.logoutButton]}
                        onPress={handleLogout}
                  >
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
                        <Text style={[styles.buttonText, { color: '#FF3B30' }]}>Log Out</Text>
                  </TouchableOpacity>
            </SafeAreaView>
      );
};

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#F5F7FA',
            padding: 20,
      },
      title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 30,
      },
      card: {
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            alignItems: 'center',
            marginBottom: 15,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
      },
      avatarContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#E1F5FE',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
      },
      name: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 5,
      },
      email: {
            fontSize: 16,
            color: '#666',
      },
      button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 15,
            marginBottom: 15,
      },
      logoutButton: {
            marginTop: 'auto',
            marginBottom: 240,
      },
      buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
      }
});

export default ProfileScreen;

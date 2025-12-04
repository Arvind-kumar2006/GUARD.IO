import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
      Image,
      KeyboardAvoidingView,
      Modal,
      Platform,
      ScrollView,
      StyleSheet,
      Text,
      TextInput,
      TouchableOpacity,
      View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
      const { logout, user } = useAuth();
      const [loading, setLoading] = useState(false);
      const [userData, setUserData] = useState({
            displayName: user?.displayName || 'User',
            email: user?.email || '',
            phone: '',
            photoURL: user?.photoURL || null,
            version: '1.0.0',
            lastActive: new Date().toLocaleString(),
      });
      const [isEditModalVisible, setIsEditModalVisible] = useState(false);
      const [editForm, setEditForm] = useState({
            displayName: '',
            phone: '',
      });

      useEffect(() => {
            fetchUserData();
      }, [user]);

      const fetchUserData = async () => {
            if (!user?.uid) return;
            try {
                  const docRef = doc(db, 'users', user.uid);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(prev => ({ ...prev, ...data }));
                  }
            } catch (error) {
                  console.error("Error fetching user data: ", error);
            }
      };

      const handleLogout = async () => {
            Alert.alert(
                  "Log Out",
                  "Are you sure you want to log out?",
                  [
                        { text: "Cancel", style: "cancel" },
                        {
                              text: "Log Out",
                              style: "destructive",
                              onPress: async () => {
                                    try {
                                          await logout();
                                    } catch (error) {
                                          console.error('Logout failed:', error);
                                          Alert.alert("Error", "Failed to log out");
                                    }
                              }
                        }
                  ]
            );
      };

      const openEditModal = () => {
            setEditForm({
                  displayName: userData.displayName,
                  phone: userData.phone || '',
            });
            setIsEditModalVisible(true);
      };

      const saveProfile = async () => {
            if (!user?.uid) return;
            setLoading(true);
            try {
                  // Update Firebase Auth
                  if (editForm.displayName !== user.displayName) {
                        await updateProfile(user, { displayName: editForm.displayName });
                  }

                  // Update Firestore
                  const userRef = doc(db, 'users', user.uid);
                  await setDoc(userRef, {
                        displayName: editForm.displayName,
                        phone: editForm.phone,
                        lastActive: new Date().toLocaleString() // Update last active on save
                  }, { merge: true });

                  setUserData(prev => ({
                        ...prev,
                        displayName: editForm.displayName,
                        phone: editForm.phone
                  }));
                  setIsEditModalVisible(false);
                  Alert.alert("Success", "Profile updated successfully!");
            } catch (error) {
                  console.error("Error updating profile: ", error);
                  Alert.alert("Error", "Failed to update profile");
            } finally {
                  setLoading(false);
            }
      };

      const ActionButton = ({ icon, label, onPress }) => (
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                  <View style={styles.actionIconContainer}>
                        <Ionicons name={icon} size={24} color="#333" />
                  </View>
                  <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
      );

      const MenuItem = ({ icon, label, onPress, isDestructive = false }) => (
            <TouchableOpacity style={styles.menuItem} onPress={onPress}>
                  <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIconContainer]}>
                        <Ionicons name={icon} size={20} color={isDestructive ? "#FF3B30" : "#333"} />
                  </View>
                  <Text style={[styles.menuText, isDestructive && styles.destructiveText]}>{label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
      );

      return (
            <View style={styles.mainContainer}>
                  <LinearGradient
                        colors={['#87CEEB', '#E0F7FA', '#FFFFFF']}
                        style={styles.headerGradient}
                  />

                  <SafeAreaView style={styles.container} edges={['top']}>
                        <View style={styles.header}>
                              <Text style={styles.headerTitle}>Profile</Text>
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                              {/* Profile Section */}
                              <View style={styles.profileSection}>
                                    <View style={styles.avatarWrapper}>
                                          <View style={styles.avatarContainer}>
                                                {userData.photoURL ? (
                                                      <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                                                ) : (
                                                      <Ionicons name="person" size={60} color="#1DA1F2" />
                                                )}
                                          </View>
                                    </View>

                                    <Text style={styles.userName}>{userData.displayName}</Text>
                                    <Text style={styles.userEmail}>{userData.email}</Text>
                                    {userData.phone ? <Text style={styles.userPhone}>{userData.phone}</Text> : null}
                                    <Text style={styles.lastActive}>Last active: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • v{userData.version}</Text>
                              </View>

                              {/* Action Buttons */}
                              <View style={styles.actionButtonsRow}>
                                    <ActionButton icon="pencil-outline" label="Edit" onPress={openEditModal} />
                                    <ActionButton icon="people-outline" label="Contacts" onPress={() => navigation.navigate('Contacts')} />
                                    <ActionButton icon="help-circle-outline" label="Help" onPress={() => Alert.alert("Help", "Contact support at support@guard.io")} />
                                    <ActionButton icon="settings-outline" label="Settings" onPress={() => Alert.alert("Settings", "Settings screen coming soon")} />
                              </View>



                              {/* Menu List */}
                              <View style={styles.menuContainer}>
                                    <MenuItem icon="person-outline" label="Personal Info" onPress={openEditModal} />
                                    <View style={styles.menuDivider} />
                                    <MenuItem icon="shield-checkmark-outline" label="Emergency Contacts" onPress={() => navigation.navigate('Contacts')} />
                                    <View style={styles.menuDivider} />
                                    <MenuItem icon="notifications-outline" label="Notification Settings" onPress={() => { }} />
                                    <View style={styles.menuDivider} />
                                    <MenuItem icon="lock-closed-outline" label="Privacy & Security" onPress={() => { }} />
                              </View>

                              {/* Danger Zone */}
                              <View style={styles.dangerZoneContainer}>
                                    <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
                                          <Ionicons name="alert-circle-outline" size={24} color="#FF3B30" />
                                          <Text style={styles.dangerText}>Danger Zone</Text>
                                          <Text style={styles.logoutText}>Log Out</Text>
                                    </TouchableOpacity>
                              </View>

                              <View style={{ height: 40 }} />
                        </ScrollView>
                  </SafeAreaView>

                  {/* Edit Profile Modal */}
                  <Modal
                        visible={isEditModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setIsEditModalVisible(false)}
                  >
                        <KeyboardAvoidingView
                              behavior={Platform.OS === "ios" ? "padding" : "height"}
                              style={styles.modalContainer}
                        >
                              <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                          <Text style={styles.modalTitle}>Edit Profile</Text>
                                          <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                                <Ionicons name="close" size={24} color="#333" />
                                          </TouchableOpacity>
                                    </View>

                                    <View style={styles.inputGroup}>
                                          <Text style={styles.inputLabel}>Full Name</Text>
                                          <TextInput
                                                style={styles.input}
                                                value={editForm.displayName}
                                                onChangeText={(text) => setEditForm(prev => ({ ...prev, displayName: text }))}
                                                placeholder="Enter your name"
                                          />
                                    </View>

                                    <View style={styles.inputGroup}>
                                          <Text style={styles.inputLabel}>Phone Number</Text>
                                          <TextInput
                                                style={styles.input}
                                                value={editForm.phone}
                                                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                                                placeholder="+91 XXXXX XXXXX"
                                                keyboardType="phone-pad"
                                          />
                                    </View>

                                    <TouchableOpacity
                                          style={styles.saveButton}
                                          onPress={saveProfile}
                                          disabled={loading}
                                    >
                                          {loading ? (
                                                <ActivityIndicator color="#FFF" />
                                          ) : (
                                                <Text style={styles.saveButtonText}>Save Changes</Text>
                                          )}
                                    </TouchableOpacity>
                              </View>
                        </KeyboardAvoidingView>
                  </Modal>

                  {loading && (
                        <View style={styles.loadingOverlay}>
                              <ActivityIndicator size="large" color="#1DA1F2" />
                        </View>
                  )}
            </View>
      );
};

const styles = StyleSheet.create({
      mainContainer: {
            flex: 1,
            backgroundColor: '#F5F7FA',
      },
      headerGradient: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 300,
      },
      container: {
            flex: 1,
      },
      header: {
            alignItems: 'center',
            paddingVertical: 10,
      },
      headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#000',
      },
      scrollContent: {
            paddingHorizontal: 20,
            paddingTop: 20,
      },
      profileSection: {
            alignItems: 'center',
            marginBottom: 24,
      },
      avatarWrapper: {
            position: 'relative',
            marginBottom: 16,
      },
      avatarContainer: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: '#FFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
      },
      avatar: {
            width: 92,
            height: 92,
            borderRadius: 46,
      },
      userName: {
            fontSize: 22,
            fontWeight: '700',
            color: '#000',
            marginBottom: 4,
      },
      userEmail: {
            fontSize: 14,
            color: '#666',
            marginBottom: 2,
      },
      userPhone: {
            fontSize: 14,
            color: '#666',
            marginBottom: 8,
      },
      lastActive: {
            fontSize: 12,
            color: '#888',
            marginTop: 4,
      },
      actionButtonsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24,
      },
      actionButton: {
            alignItems: 'center',
            width: '23%',
            backgroundColor: '#FFF',
            paddingVertical: 12,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
      },
      actionIconContainer: {
            marginBottom: 8,
      },
      actionLabel: {
            fontSize: 12,
            color: '#333',
            fontWeight: '500',
      },

      menuContainer: {
            backgroundColor: '#FFF',
            borderRadius: 16,
            paddingVertical: 8,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
      },
      menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
      },
      menuDivider: {
            height: 1,
            backgroundColor: '#F0F0F0',
            marginLeft: 56,
      },
      menuIconContainer: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#F5F7FA',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
      },
      destructiveIconContainer: {
            backgroundColor: '#FFF0EF',
      },
      menuText: {
            flex: 1,
            fontSize: 16,
            color: '#333',
            fontWeight: '500',
      },
      destructiveText: {
            color: '#FF3B30',
      },
      dangerZoneContainer: {
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
      },
      dangerItem: {
            flexDirection: 'row',
            alignItems: 'center',
      },
      dangerText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#000',
            marginLeft: 12,
            flex: 1,
      },
      logoutText: {
            fontSize: 14,
            color: '#FF3B30',
            fontWeight: '600',
      },

      // Modal Styles
      modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modalContent: {
            backgroundColor: '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
      },
      modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
      },
      modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: '#333',
      },
      inputGroup: {
            marginBottom: 20,
      },
      inputLabel: {
            fontSize: 14,
            color: '#666',
            marginBottom: 8,
            fontWeight: '500',
      },
      input: {
            backgroundColor: '#F5F7FA',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: '#333',
      },
      saveButton: {
            backgroundColor: '#1DA1F2',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginTop: 10,
      },
      saveButtonText: {
            color: '#FFF',
            fontSize: 16,
            fontWeight: '600',
      },
      loadingOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
      },
});

export default ProfileScreen;

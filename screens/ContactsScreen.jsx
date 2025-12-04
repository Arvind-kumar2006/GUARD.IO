import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
      addDoc,
      collection,
      deleteDoc,
      doc,
      onSnapshot,
      orderBy,
      query,
      serverTimestamp,
      updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
      Dimensions,
      FlatList,
      KeyboardAvoidingView,
      Modal,
      Platform,
      StyleSheet,
      Text,
      TextInput,
      TouchableOpacity,
      View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

export default function ContactsScreen({ navigation }) {
      const [contacts, setContacts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [modalVisible, setModalVisible] = useState(false);
      const [editingContact, setEditingContact] = useState(null);
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');

      // 1️⃣ LOAD CONTACTS (Real-time)
      useEffect(() => {
            const user = auth.currentUser;
            if (!user) {
                  setLoading(false);
                  return;
            }

            const q = query(
                  collection(db, 'users', user.uid, 'contacts'),
                  orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                  const contactsList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                  }));
                  setContacts(contactsList);
                  setLoading(false);
            });

            return () => unsubscribe();
      }, []);

      // Helper: Get Initials
      const getInitials = (fullName) => {
            if (!fullName) return '';
            const names = fullName.split(' ');
            if (names.length === 1) return names[0].charAt(0).toUpperCase();
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      };

      // 2️⃣ ADD CONTACT
      const handleAddContact = async () => {
            if (!name.trim() || !phone.trim()) {
                  Alert.alert('Error', 'Please fill in all fields');
                  return;
            }

            try {
                  const user = auth.currentUser;
                  if (!user) return;

                  await addDoc(collection(db, 'users', user.uid, 'contacts'), {
                        name: name.trim(),
                        phone: phone.trim(),
                        createdAt: serverTimestamp(),
                  });

                  closeModal();
            } catch (error) {
                  Alert.alert('Error', 'Failed to add contact');
                  console.error(error);
            }
      };

      // 3️⃣ EDIT CONTACT
      const handleUpdateContact = async () => {
            if (!name.trim() || !phone.trim()) {
                  Alert.alert('Error', 'Please fill in all fields');
                  return;
            }

            try {
                  const user = auth.currentUser;
                  if (!user) return;

                  const contactRef = doc(db, 'users', user.uid, 'contacts', editingContact.id);
                  await updateDoc(contactRef, {
                        name: name.trim(),
                        phone: phone.trim(),
                        updatedAt: serverTimestamp(),
                  });

                  closeModal();
            } catch (error) {
                  Alert.alert('Error', 'Failed to update contact');
                  console.error(error);
            }
      };

      // 4️⃣ DELETE CONTACT
      const handleDeleteContact = (contactId) => {
            Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                              try {
                                    const user = auth.currentUser;
                                    if (!user) return;
                                    await deleteDoc(doc(db, 'users', user.uid, 'contacts', contactId));
                              } catch (error) {
                                    Alert.alert('Error', 'Failed to delete contact');
                                    console.error(error);
                              }
                        },
                  },
            ]);
      };

      const openModal = (contact = null) => {
            if (contact) {
                  setEditingContact(contact);
                  setName(contact.name);
                  setPhone(contact.phone);
            } else {
                  setEditingContact(null);
                  setName('');
                  setPhone('');
            }
            setModalVisible(true);
      };

      const closeModal = () => {
            setModalVisible(false);
            setEditingContact(null);
            setName('');
            setPhone('');
      };

      const renderItem = ({ item }) => (
            <View style={styles.card}>
                  <View style={styles.cardContent}>
                        {/* Avatar */}
                        <View style={styles.avatar}>
                              <Text style={styles.avatarText}>
                                    {getInitials(item.name)}
                              </Text>
                        </View>

                        {/* Info */}
                        <View style={styles.info}>
                              <Text style={styles.name}>{item.name}</Text>
                              {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
                        </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.actions}>
                        <TouchableOpacity
                              onPress={() => openModal(item)}
                              style={styles.actionButton}
                        >
                              <Feather name="edit-2" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                              onPress={() => handleDeleteContact(item.id)}
                              style={styles.actionButton}
                        >
                              <Feather name="trash-2" size={20} color="#EF4444" />
                        </TouchableOpacity>
                  </View>
            </View>
      );

      return (
            <SafeAreaView style={styles.container} edges={['top']}>
                  <View style={styles.mainContent}>
                        {/* Header */}
                        <View style={styles.header}>
                              <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backButton}
                              >
                                    <Feather name="arrow-left" size={24} color="#111827" />
                              </TouchableOpacity>
                              <Text style={styles.headerTitle}>My Contacts</Text>
                              <TouchableOpacity
                                    onPress={() => openModal()}
                                    style={styles.addButtonHeader}
                              >
                                    <Feather name="plus" size={28} color="#2DD4BF" />
                              </TouchableOpacity>
                        </View>

                        {/* Content */}
                        {loading ? (
                              <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#2DD4BF" />
                              </View>
                        ) : (
                              <FlatList
                                    data={contacts}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderItem}
                                    contentContainerStyle={styles.listContent}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                          <View style={styles.emptyState}>
                                                <View style={styles.emptyIcon}>
                                                      <Feather name="users" size={32} color="#9CA3AF" />
                                                </View>
                                                <Text style={styles.emptyTitle}>
                                                      No contacts yet
                                                </Text>
                                                <Text style={styles.emptySubtitle}>
                                                      Add your trusted contacts here
                                                </Text>
                                          </View>
                                    }
                              />
                        )}

                        {/* Bottom Button */}
                        <View style={styles.bottomButtonContainer}>
                              <TouchableOpacity onPress={() => openModal()} activeOpacity={0.9}>
                                    <LinearGradient
                                          colors={['#67E8F9', '#2DD4BF']}
                                          start={{ x: 0, y: 0 }}
                                          end={{ x: 1, y: 0 }}
                                          style={styles.gradientButton}
                                    >
                                          <Text style={styles.gradientButtonText}>Add New Contact</Text>
                                    </LinearGradient>
                              </TouchableOpacity>
                        </View>

                        {/* Add/Edit Modal */}
                        <Modal
                              animationType="slide"
                              transparent={true}
                              visible={modalVisible}
                              onRequestClose={closeModal}
                        >
                              <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    style={styles.modalKeyboardAvoid}
                              >
                                    <View style={styles.modalOverlay}>
                                          <View style={styles.modalContent}>
                                                <View style={styles.modalHeader}>
                                                      <Text style={styles.modalTitle}>
                                                            {editingContact ? 'Edit Contact' : 'New Contact'}
                                                      </Text>
                                                      <TouchableOpacity onPress={closeModal}>
                                                            <Feather name="x" size={24} color="#6B7280" />
                                                      </TouchableOpacity>
                                                </View>

                                                <View style={styles.formContainer}>
                                                      <View style={styles.inputGroup}>
                                                            <Text style={styles.label}>Name</Text>
                                                            <TextInput
                                                                  style={styles.input}
                                                                  placeholder="Enter name"
                                                                  value={name}
                                                                  onChangeText={setName}
                                                                  placeholderTextColor="#9CA3AF"
                                                            />
                                                      </View>
                                                      <View style={styles.inputGroup}>
                                                            <Text style={styles.label}>Phone</Text>
                                                            <TextInput
                                                                  style={styles.input}
                                                                  placeholder="Enter phone number"
                                                                  value={phone}
                                                                  onChangeText={setPhone}
                                                                  keyboardType="phone-pad"
                                                                  placeholderTextColor="#9CA3AF"
                                                            />
                                                      </View>
                                                </View>

                                                <TouchableOpacity
                                                      onPress={editingContact ? handleUpdateContact : handleAddContact}
                                                      activeOpacity={0.9}
                                                >
                                                      <LinearGradient
                                                            colors={['#67E8F9', '#2DD4BF']}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 0 }}
                                                            style={styles.modalButton}
                                                      >
                                                            <Text style={styles.modalButtonText}>
                                                                  {editingContact ? 'Save Changes' : 'Save Contact'}
                                                            </Text>
                                                      </LinearGradient>
                                                </TouchableOpacity>
                                          </View>
                                    </View>
                              </KeyboardAvoidingView>
                        </Modal>
                  </View>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#FFFFFF',
      },
      mainContent: {
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 24,
      },
      header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
      },
      backButton: {
            padding: 8,
            marginRight: 8,
      },
      headerTitle: {
            fontSize: 30,
            fontWeight: '700',
            color: '#111827',
      },
      addButtonHeader: {
            padding: 8,
      },
      loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
      },
      listContent: {
            paddingBottom: 100,
      },
      card: {
            backgroundColor: '#F3F4F6',
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
      },
      cardContent: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
      },
      avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#D1D5DB',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
      },
      avatarText: {
            color: '#374151',
            fontWeight: '700',
            fontSize: 18,
      },
      info: {
            flex: 1,
      },
      name: {
            color: '#111827',
            fontWeight: '700',
            fontSize: 18,
      },
      phone: {
            color: '#6B7280',
            fontSize: 14,
            marginTop: 2,
      },
      actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
      },
      actionButton: {
            padding: 8,
      },
      emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 80,
      },
      emptyIcon: {
            width: 80,
            height: 80,
            backgroundColor: '#F3F4F6',
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
      },
      emptyTitle: {
            color: '#6B7280',
            fontSize: 18,
            fontWeight: '500',
      },
      emptySubtitle: {
            color: '#9CA3AF',
            fontSize: 14,
            marginTop: 4,
      },
      bottomButtonContainer: {
            position: 'absolute',
            bottom: 40,
            left: 24,
            right: 24,
      },
      gradientButton: {
            paddingVertical: 16,
            borderRadius: 9999,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
      },
      gradientButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 18,
      },
      modalKeyboardAvoid: {
            flex: 1,
            justifyContent: 'flex-end',
      },
      modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
      },
      modalContent: {
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
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
            color: '#111827',
      },
      formContainer: {
            marginBottom: 24,
      },
      inputGroup: {
            marginBottom: 16,
      },
      label: {
            color: '#4B5563',
            marginBottom: 8,
            fontWeight: '500',
      },
      input: {
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            padding: 16,
            color: '#1F2937',
            fontSize: 16,
      },
      modalButton: {
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
      },
      modalButtonText: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 18,
      },
});

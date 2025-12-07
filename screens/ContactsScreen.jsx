import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
      ActivityIndicator,
      Alert,
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

export default function ContactsScreen({ navigation }) {
      const [contacts, setContacts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [modalVisible, setModalVisible] = useState(false);
      const [editingContact, setEditingContact] = useState(null);
      const [name, setName] = useState('');
      const [phone, setPhone] = useState('');

      // 1️⃣ LOAD CONTACTS
      useEffect(() => {
            if (!auth.currentUser) return;
            const q = query(collection(db, 'users', auth.currentUser.uid, 'contacts'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                  setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                  setLoading(false);
            });
            return unsubscribe;
      }, []);

      // 2️⃣ SAVE CONTACT (Add or Update)
      const handleSave = async () => {
            if (!name.trim() || !phone.trim()) return Alert.alert('Error', 'Fill all fields');
            try {
                  const user = auth.currentUser;
                  if (editingContact) {
                        await updateDoc(doc(db, 'users', user.uid, 'contacts', editingContact.id), {
                              name: name.trim(), phone: phone.trim(), updatedAt: serverTimestamp()
                        });
                  } else {
                        await addDoc(collection(db, 'users', user.uid, 'contacts'), {
                              name: name.trim(), phone: phone.trim(), createdAt: serverTimestamp()
                        });
                  }
                  closeModal();
            } catch (e) { Alert.alert('Error', 'Failed to save'); }
      };

      // 3️⃣ DELETE CONTACT
      const handleDelete = (id) => {
            Alert.alert('Delete', 'Sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                        text: 'Delete', style: 'destructive', onPress: async () => {
                              try { await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'contacts', id)); }
                              catch (e) { Alert.alert('Error', 'Failed to delete'); }
                        }
                  }
            ]);
      };

      const openModal = (contact = null) => {
            setEditingContact(contact);
            setName(contact ? contact.name : '');
            setPhone(contact ? contact.phone : '');
            setModalVisible(true);
      };

      const closeModal = () => {
            setModalVisible(false);
            setEditingContact(null);
            setName('');
            setPhone('');
      };

      return (
            <SafeAreaView style={styles.container}>
                  <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                              <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Contacts</Text>
                        <TouchableOpacity onPress={() => openModal()}>
                              <Ionicons name="add-circle" size={32} color="#1DA1F2" />
                        </TouchableOpacity>
                  </View>

                  {loading ? (
                        <ActivityIndicator size="large" color="#1DA1F2" style={{ marginTop: 50 }} />
                  ) : (
                        <FlatList
                              data={contacts}
                              keyExtractor={item => item.id}
                              style={styles.list}
                              ListEmptyComponent={<Text style={styles.emptyText}>No contacts yet.</Text>}
                              renderItem={({ item }) => (
                                    <View style={styles.card}>
                                          <View>
                                                <Text style={styles.cardName}>{item.name}</Text>
                                                <Text style={styles.cardPhone}>{item.phone}</Text>
                                          </View>
                                          <View style={styles.actions}>
                                                <TouchableOpacity onPress={() => openModal(item)} style={{ marginRight: 15 }}>
                                                      <Ionicons name="pencil" size={20} color="#666" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                                      <Ionicons name="trash" size={20} color="#FF3B30" />
                                                </TouchableOpacity>
                                          </View>
                                    </View>
                              )}
                        />
                  )}

                  <Modal visible={modalVisible} animationType="slide" transparent>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
                              <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'New Contact'}</Text>
                                    <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                                    <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                                    <View style={styles.modalButtons}>
                                          <TouchableOpacity onPress={closeModal} style={[styles.btn, styles.btnCancel]}>
                                                <Text style={styles.btnTextCancel}>Cancel</Text>
                                          </TouchableOpacity>
                                          <TouchableOpacity onPress={handleSave} style={[styles.btn, styles.btnSave]}>
                                                <Text style={styles.btnTextSave}>Save</Text>
                                          </TouchableOpacity>
                                    </View>
                              </View>
                        </KeyboardAvoidingView>
                  </Modal>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F7FA', 
    padding: 20 
  },

  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },

  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333' 
  },

  list: { 
    flex: 1 
  },

  emptyText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 50, 
    fontSize: 16 
  },

  card: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },

  cardName: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#333' 
  },

  cardPhone: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 2 
  },

  actions: { 
    flexDirection: 'row' 
  },

  modalBg: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },

  modalContent: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 20 
  },

  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },

  input: { 
    backgroundColor: '#F0F0F0', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15, 
    fontSize: 16 
  },

  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },

  btn: { 
    flex: 1, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginHorizontal: 5 
  },

  btnCancel: { 
    backgroundColor: '#EEE' 
  },

  btnSave: { 
    backgroundColor: '#1DA1F2' 
  },

  btnTextCancel: { 
    color: '#666', 
    fontWeight: '600' 
  },

  btnTextSave: { 
    color: 'white', 
    fontWeight: '600' 
  },
});

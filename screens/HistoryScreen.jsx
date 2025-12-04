import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
      ActivityIndicator,
      FlatList,
      Linking,
      RefreshControl,
      StyleSheet,
      Text,
      TouchableOpacity,
      View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

const HistoryScreen = () => {
      const [history, setHistory] = useState([]);
      const [loading, setLoading] = useState(true);
      const [refreshing, setRefreshing] = useState(false);

      const fetchHistory = async () => {
            try {
                  const user = auth.currentUser;
                  if (!user) return;

                  const q = query(
                        collection(db, 'users', user.uid, 'history'),
                        orderBy('timestamp', 'desc')
                  );

                  const querySnapshot = await getDocs(q);
                  const historyData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                  }));

                  setHistory(historyData);
            } catch (error) {
                  console.error("Error fetching history:", error);
            } finally {
                  setLoading(false);
                  setRefreshing(false);
            }
      };

      useEffect(() => {
            fetchHistory();
      }, []);

      const onRefresh = () => {
            setRefreshing(true);
            fetchHistory();
      };

      const openLink = (url) => {
            if (url) {
                  Linking.openURL(url);
            }
      };

      const renderItem = ({ item }) => {
            const date = new Date(item.timestamp).toLocaleDateString();
            const time = new Date(item.timestamp).toLocaleTimeString();

            return (
                  <View style={styles.card}>
                        <View style={styles.cardHeader}>
                              <View style={styles.typeContainer}>
                                    <Ionicons
                                          name={item.type === 'SOS' ? 'warning' : 'location'}
                                          size={20}
                                          color={item.type === 'SOS' ? '#FF3B30' : '#1DA1F2'}
                                    />
                                    <Text style={[styles.typeText, { color: item.type === 'SOS' ? '#FF3B30' : '#1DA1F2' }]}>
                                          {item.type === 'SOS' ? 'SOS Alert' : 'Live Tracking'}
                                    </Text>
                              </View>
                              <Text style={styles.dateText}>{date} • {time}</Text>
                        </View>

                        <View style={styles.divider} />

                        <TouchableOpacity
                              style={styles.linkButton}
                              onPress={() => openLink(item.link)}
                        >
                              <Text style={styles.linkText} numberOfLines={1}>{item.link}</Text>
                              <Ionicons name="open-outline" size={16} color="#666" />
                        </TouchableOpacity>
                  </View>
            );
      };

      return (
            <SafeAreaView style={styles.container} edges={['top']}>
                  <View style={styles.header}>
                        <Text style={styles.headerTitle}>Tracking History</Text>
                  </View>

                  {loading ? (
                        <View style={styles.centerContainer}>
                              <ActivityIndicator size="large" color="#1DA1F2" />
                        </View>
                  ) : (
                        <FlatList
                              data={history}
                              renderItem={renderItem}
                              keyExtractor={item => item.id}
                              contentContainerStyle={styles.listContent}
                              refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                              }
                              ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                          <Ionicons name="time-outline" size={64} color="#ccc" />
                                          <Text style={styles.emptyText}>No history yet</Text>
                                    </View>
                              }
                        />
                  )}
            </SafeAreaView>
      );
};

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#F5F5F5',
      },
      header: {
            padding: 20,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E5',
      },
      headerTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
      },
      listContent: {
            padding: 16,
      },
      centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
      },
      card: {
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
      },
      cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
      },
      typeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
      },
      typeText: {
            fontWeight: '600',
            fontSize: 14,
      },
      dateText: {
            color: '#999',
            fontSize: 12,
      },
      divider: {
            height: 1,
            backgroundColor: '#F0F0F0',
            marginBottom: 12,
      },
      linkButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8F9FA',
            padding: 10,
            borderRadius: 8,
      },
      linkText: {
            color: '#666',
            fontSize: 12,
            flex: 1,
            marginRight: 8,
      },
      emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 60,
      },
      emptyText: {
            marginTop: 16,
            color: '#999',
            fontSize: 16,
      },
});

export default HistoryScreen;

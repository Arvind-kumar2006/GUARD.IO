import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
      Alert,
      Dimensions,
      Share,
      StyleSheet,
      Text,
      TouchableOpacity,
      View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

const SOSScreen = ({ navigation }) => {
      const [countdown, setCountdown] = useState(3);
      const [isSending, setIsSending] = useState(false);
      const [isTracking, setIsTracking] = useState(false);
      const [sessionId, setSessionId] = useState(null);
      const timerRef = useRef(null);
      const locationSubscription = useRef(null);

      useEffect(() => {
            startCountdown();
            return () => {
                  clearInterval(timerRef.current);
                  if (locationSubscription.current) {
                        locationSubscription.current.remove();
                  }
            };
      }, []);

      const startCountdown = () => {
            timerRef.current = setInterval(() => {
                  setCountdown((prev) => {
                        if (prev <= 1) {
                              clearInterval(timerRef.current);
                              handleSendSOS();
                              return 0;
                        }
                        return prev - 1;
                  });
            }, 1000);
      };

      const handleCancel = () => {
            clearInterval(timerRef.current);
            navigation.goBack();
      };

      const generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
            });
      };

      const startTracking = async () => {
            try {
                  const newSessionId = generateUUID();
                  setSessionId(newSessionId);

                  await setDoc(doc(db, "liveLocations", newSessionId), {
                        latitude: null,
                        longitude: null,
                        timestamp: Date.now(),
                        isActive: true,
                        status: "waiting"
                  });

                  locationSubscription.current = await Location.watchPositionAsync(
                        {
                              accuracy: Location.Accuracy.High,
                              distanceInterval: 10,
                        },
                        async (newLocation) => {
                              const { latitude, longitude, speed, heading } = newLocation.coords;
                              const timestamp = newLocation.timestamp;

                              await setDoc(doc(db, "liveLocations", newSessionId), {
                                    latitude,
                                    longitude,
                                    speed,
                                    heading,
                                    timestamp,
                                    isActive: true,
                                    status: "live"
                              });

                              await setDoc(doc(db, `liveLocations/${newSessionId}/history`, `${timestamp}`), {
                                    latitude,
                                    longitude,
                                    timestamp
                              });
                        }
                  );

                  return newSessionId;
            } catch (error) {
                  console.error("Tracking Error:", error);
                  throw error;
            }
      };

      const stopTracking = async () => {
            if (locationSubscription.current) {
                  locationSubscription.current.remove();
            }
            if (sessionId) {
                  try {
                        const user = auth.currentUser;
                        if (user) {
                              const historyRef = doc(db, 'users', user.uid, 'history', sessionId);
                              await setDoc(historyRef, {
                                    sessionId,
                                    timestamp: Date.now(),
                                    link: `https://guardio-f6f26.web.app/?sessionId=${sessionId}`,
                                    type: 'SOS',
                                    status: 'ended'
                              });
                        }

                        await deleteDoc(doc(db, "liveLocations", sessionId));
                  } catch (e) {
                        console.error("Error deleting session:", e);
                  }
            }
            navigation.goBack();
      };

      const handleSendSOS = async () => {
            setIsSending(true);
            try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                        Alert.alert('Permission Denied', 'Location permission is required.');
                        setIsSending(false);
                        return;
                  }

                  const newSessionId = await startTracking();
                  const liveLink = `https://guardio-f6f26.web.app/?sessionId=${newSessionId}`;

                  const user = auth.currentUser;
                  let contactsList = [];
                  if (user) {
                        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'contacts'));
                        contactsList = querySnapshot.docs.map(doc => doc.data());
                  }
                  const phoneNumbers = contactsList.map(c => c.phone).filter(p => p);

                  const message = `SOS! I need help!\nTrack my live location here:\n${liveLink}`;

                  const isAvailable = await SMS.isAvailableAsync();
                  if (isAvailable && phoneNumbers.length > 0) {
                        await SMS.sendSMSAsync(phoneNumbers, message);
                  } else {
                        await Share.share({ message });
                  }

                  setIsTracking(true);
                  setIsSending(false);

            } catch (error) {
                  Alert.alert('Error', 'Failed to send SOS.');
                  console.error(error);
                  setIsSending(false);
                  stopTracking();
            }
      };

      if (isTracking) {
            return (
                  <LinearGradient colors={['#FF3B30', '#D70015']} style={styles.container}>
                        <SafeAreaView style={styles.content}>
                              <View style={styles.alertContainer}>
                                    <View style={styles.pulseCircle}>
                                          <Text style={styles.alertIcon}>🚨</Text>
                                    </View>
                                    <Text style={styles.alertTitle}>SOS SENT</Text>
                                    <Text style={styles.alertDesc}>
                                          Your contacts have been notified with your live location.
                                    </Text>
                                    <View style={styles.liveBadge}>
                                          <View style={styles.liveDot} />
                                          <Text style={styles.liveText}>LIVE TRACKING ACTIVE</Text>
                                    </View>
                              </View>

                              <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                          style={styles.stopButton}
                                          onPress={() => {
                                                Alert.alert(
                                                      "Stop SOS?",
                                                      "This will stop sharing your live location.",
                                                      [
                                                            { text: "Cancel", style: "cancel" },
                                                            { text: "Stop & Exit", style: "destructive", onPress: stopTracking }
                                                      ]
                                                );
                                          }}
                                    >
                                          <Text style={styles.stopButtonText}>Stop Sharing & Exit</Text>
                                    </TouchableOpacity>
                              </View>
                        </SafeAreaView>
                  </LinearGradient>
            );
      }

      return (
            <LinearGradient
                  colors={['#FF8C61', '#FF5A46']}
                  style={styles.container}
            >
                  <SafeAreaView style={styles.content}>
                        <View style={styles.timerContainer}>
                              <View style={styles.circle}>
                                    <Text style={styles.timerText}>{countdown}</Text>
                              </View>
                        </View>

                        <View style={styles.textContainer}>
                              <Text style={styles.statusText}>
                                    {isSending ? 'Initiating SOS...' : 'SOS will be sent to\nyour contacts in...'}
                              </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                              <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                    activeOpacity={0.8}
                              >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                              </TouchableOpacity>
                        </View>
                  </SafeAreaView>
            </LinearGradient>
      );
};

const styles = StyleSheet.create({
      container: {
            flex: 1,
      },
      content: {
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 60,
      },
      timerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
      },
      circle: {
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 8,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      timerText: {
            fontSize: 100,
            fontWeight: 'bold',
            color: '#FFFFFF',
      },
      textContainer: {
            marginBottom: 40,
            alignItems: 'center',
      },
      statusText: {
            fontSize: 20,
            color: '#FFFFFF',
            textAlign: 'center',
            fontWeight: '500',
            lineHeight: 28,
      },
      buttonContainer: {
            width: '100%',
            paddingHorizontal: 40,
      },
      cancelButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            paddingVertical: 18,
            borderRadius: 30,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
      },
      cancelButtonText: {
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 'bold',
      },
      alertContainer: {
            alignItems: 'center',
            marginTop: 40,
      },
      pulseCircle: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
      },
      alertIcon: {
            fontSize: 48,
      },
      alertTitle: {
            fontSize: 32,
            fontWeight: '800',
            color: 'white',
            marginBottom: 12,
      },
      alertDesc: {
            fontSize: 16,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            paddingHorizontal: 40,
            marginBottom: 32,
            lineHeight: 24,
      },
      liveBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
      },
      liveDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#FF3B30',
            marginRight: 8,
      },
      liveText: {
            color: '#FF3B30',
            fontWeight: '700',
            fontSize: 12,
      },
      stopButton: {
            backgroundColor: 'white',
            paddingVertical: 20,
            borderRadius: 30,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
      },
      stopButtonText: {
            color: '#FF3B30',
            fontSize: 18,
            fontWeight: '700',
      },
});

export default SOSScreen;

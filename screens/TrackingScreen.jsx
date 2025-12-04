import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

const TrackingScreen = () => {
      const [location, setLocation] = useState(null);
      const [isSharing, setIsSharing] = useState(false);
      const [sessionId, setSessionId] = useState(null);
      const [lastSentTime, setLastSentTime] = useState(null);
      const mapRef = useRef(null);
      const locationSubscription = useRef(null);

      useEffect(() => {
            (async () => {
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                        console.log('Permission to access location was denied');
                        return;
                  }

                  let currentLocation = await Location.getCurrentPositionAsync({});
                  setLocation(currentLocation);

                  if (mapRef.current && currentLocation) {
                        mapRef.current.animateCamera({
                              center: {
                                    latitude: currentLocation.coords.latitude,
                                    longitude: currentLocation.coords.longitude,
                              },
                              zoom: 15,
                        });
                  }
            })();

            return () => {
                  stopSharing(); // Cleanup on unmount
            };
      }, []);

      const startSharing = async () => {
            try {
                  console.log("Starting live tracking (Firestore)...");
                  // Simple UUID generator since crypto.randomUUID is not available
                  const generateUUID = () => {
                        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                              return v.toString(16);
                        });
                  };

                  const newSessionId = generateUUID();
                  setSessionId(newSessionId);
                  setIsSharing(true);
                  console.log(`Generated Session ID: ${newSessionId}`);

                  // Seed Firestore document immediately so receiver link has something to read
                  await setDoc(doc(db, "liveLocations", newSessionId), {
                        latitude: null,
                        longitude: null,
                        speed: null,
                        heading: null,
                        timestamp: Date.now(),
                        isActive: true,
                        status: "waiting"
                  });

                  // Start watching location
                  locationSubscription.current = await Location.watchPositionAsync(
                        {
                              accuracy: Location.Accuracy.High,
                              distanceInterval: 10, // Update every 10 meters
                        },
                        async (newLocation) => {
                              try {
                                    setLocation(newLocation);

                                    const { latitude, longitude, speed, heading } = newLocation.coords;
                                    const timestamp = newLocation.timestamp;

                                    console.log(`Location update sent: ${latitude}, ${longitude}`);

                                    // Update Firestore - Live Location
                                    await setDoc(doc(db, "liveLocations", newSessionId), {
                                          latitude,
                                          longitude,
                                          speed,
                                          heading,
                                          timestamp,
                                          isActive: true,
                                          status: "live"
                                    });

                                    setLastSentTime(new Date().toLocaleTimeString());

                                    // Push to History (Subcollection)
                                    await setDoc(doc(db, `liveLocations/${newSessionId}/history`, `${timestamp}`), {
                                          latitude,
                                          longitude,
                                          timestamp
                                    });

                                    // Animate map to new location
                                    if (mapRef.current) {
                                          mapRef.current.animateCamera({
                                                center: {
                                                      latitude,
                                                      longitude,
                                                },
                                          });
                                    }
                              } catch (writeError) {
                                    console.error("Firestore Write Error:", writeError);
                                    Alert.alert("Write Error", writeError.message);
                              }
                        }
                  );

                  // Share the link
                  // NOTE: Replace 'guardio-f6f26.web.app' with your actual Firebase Hosting URL if different
                  const shareUrl = `https://guardio-f6f26.web.app/?sessionId=${newSessionId}`;
                  console.log(`Share URL: ${shareUrl}`);

                  await Share.share({
                        message: `Track my live location: ${shareUrl}`,
                  });

            } catch (error) {
                  console.error("Error starting live tracking:", error);
                  Alert.alert("Error", "Failed to start live tracking: " + error.message);
                  setIsSharing(false);
            }
      };

      const stopSharing = async () => {
            console.log("Stopping live tracking...");
            if (locationSubscription.current) {
                  locationSubscription.current.remove();
                  locationSubscription.current = null;
            }

            if (sessionId) {
                  try {
                        // Save to History before deleting
                        const user = auth.currentUser; // Ensure auth is imported from '../config/firebase'
                        if (user) {
                              const historyRef = doc(db, 'users', user.uid, 'history', sessionId);
                              await setDoc(historyRef, {
                                    sessionId,
                                    timestamp: Date.now(),
                                    link: `https://guardio-f6f26.web.app/?sessionId=${sessionId}`,
                                    type: 'Tracking',
                                    status: 'ended'
                              });
                        }

                        // Mark as inactive or delete
                        console.log(`Removing session: ${sessionId}`);
                        await deleteDoc(doc(db, "liveLocations", sessionId));
                  } catch (error) {
                        console.error("Error stopping session:", error);
                  }
            }

            setIsSharing(false);
            setSessionId(null);
            setLastSentTime(null);
      };

      const handleShareToggle = () => {
            if (isSharing) {
                  stopSharing();
            } else {
                  startSharing();
            }
      };

      return (
            <View style={styles.container}>
                  {/* Map Background */}
                  <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        initialRegion={{
                              latitude: location?.coords.latitude || 37.78825,
                              longitude: location?.coords.longitude || -122.4324,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421,
                        }}
                  />

                  {/* Overlay UI */}
                  <SafeAreaView style={styles.overlay} edges={['top']}>
                        <View style={styles.headerContainer}>
                              <View>
                                    <Text style={styles.headerTitle}>Live Tracking</Text>
                                    {lastSentTime && (
                                          <Text style={styles.lastSentText}>Last Sent: {lastSentTime}</Text>
                                    )}
                              </View>
                              {isSharing && (
                                    <View style={styles.liveBadge}>
                                          <View style={styles.liveDot} />
                                          <Text style={styles.liveText}>LIVE</Text>
                                    </View>
                              )}
                        </View>

                        <View style={styles.bottomContainer}>
                              {/* Action Buttons */}
                              <View style={styles.buttonsContainer}>
                                    <TouchableOpacity
                                          style={[styles.startButton, isSharing && styles.stopButton]}
                                          onPress={handleShareToggle}
                                          activeOpacity={0.8}
                                    >
                                          <Text style={styles.startButtonText}>
                                                {isSharing ? 'Stop Sharing' : 'Share Live Location'}
                                          </Text>
                                          <Ionicons
                                                name={isSharing ? "stop-circle-outline" : "share-outline"}
                                                size={24}
                                                color="#FFF"
                                          />
                                    </TouchableOpacity>
                              </View>
                        </View>
                  </SafeAreaView>
            </View>
      );
};

const styles = StyleSheet.create({
      container: {
            flex: 1,
            backgroundColor: '#fff',
      },
      map: {
            ...StyleSheet.absoluteFillObject,
      },
      overlay: {
            flex: 1,
            justifyContent: 'space-between',
      },
      headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 10,
      },
      headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#333',
      },
      lastSentText: {
            fontSize: 12,
            color: '#666',
            marginTop: 2,
      },
      liveBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FF3B30',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
      },
      liveDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#FFF',
            marginRight: 4,
      },
      liveText: {
            color: '#FFF',
            fontSize: 10,
            fontWeight: '700',
      },
      bottomContainer: {
            padding: 20,
            paddingBottom: 30,
      },
      buttonsContainer: {
            width: '100%',
      },
      startButton: {
            backgroundColor: '#1DA1F2',
            borderRadius: 16,
            paddingVertical: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#1DA1F2',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
      },
      stopButton: {
            backgroundColor: '#FF3B30',
            shadowColor: '#FF3B30',
      },
      startButtonText: {
            color: '#FFF',
            fontSize: 18,
            fontWeight: '700',
            marginRight: 8,
      },
});

export default TrackingScreen;

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackingScreen from '../screens/TrackingScreen';

import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
      return (
            <Tab.Navigator
                  screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarIcon: ({ focused, color, size }) => {
                              let iconName;

                              if (route.name === 'Home') {
                                    iconName = focused ? 'home' : 'home-outline';
                              } else if (route.name === 'Tracking') {
                                    iconName = focused ? 'location' : 'location-outline';
                              } else if (route.name === 'History') {
                                    iconName = focused ? 'time' : 'time-outline';
                              } else if (route.name === 'Profile') {
                                    iconName = focused ? 'person' : 'person-outline';
                              }

                              return <Ionicons name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: '#1DA1F2',
                        tabBarInactiveTintColor: 'gray',
                        tabBarStyle: {
                              borderTopWidth: 1,
                              borderTopColor: '#F0F0F0',
                              height: 60,
                              paddingBottom: 8,
                              paddingTop: 8,
                        },
                  })}
            >
                  <Tab.Screen name="Home" component={HomeScreen} />
                  <Tab.Screen name="Tracking" component={TrackingScreen} />
                  <Tab.Screen name="History" component={HistoryScreen} />
                  <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
      );
};

export default TabNavigator;

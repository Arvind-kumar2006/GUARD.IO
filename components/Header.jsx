import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Header = ({ 
  title, 
  showBack = false, 
  onBackPress, 
  rightIcon, 
  onRightIconPress,
  logo = false 
}) => {
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      )}
      
      {logo ? (
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={28} color="#1DA1F2" />
          </View>
          <Text style={styles.logoText}>GUARD.IO</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightButton}>
          <Ionicons name={rightIcon} size={24} color="#333" />
        </TouchableOpacity>
      )}
      
      {!rightIcon && showBack && <View style={styles.placeholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1DA1F2',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  rightButton: {
    padding: 8,
    marginRight: -8,
  },
  placeholder: {
    width: 40,
  },
});

export default Header;


import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore.js'
import styles from "../../assets/styles/settings.styles.js";
import COLORS from "../../assets/constants/colors.js";
import { Ionicons } from '@expo/vector-icons';


export default function Settings() {
  const navigation = useNavigation();
  const { logout } = useAuthStore();

    const handleEditEmail = () => {
    Alert.alert("Edit Email", "Email update screen.");
  };

  const handleReportIssue = () => {
    Alert.alert("Report Issue", "Open feedback form or email client.");
  };

  return (
     <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <TouchableOpacity style={styles.option}>
        <Ionicons name="home-outline" size={20} color={COLORS.textPrimary} />
        <Text style={styles.optionText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleEditEmail}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textPrimary} />
        <Text style={styles.optionText}>Edit Personal Info</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleReportIssue}>
        <Ionicons name="alert-circle-outline" size={20} color={COLORS.textPrimary} />
        <Text style={styles.optionText}>Report Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.option, styles.logout]} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="red" />
        <Text style={[styles.optionText, { color: "red" }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

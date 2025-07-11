import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import styles from "../../assets/styles/signup.styles.js";
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../assets/constants/colors';
import { Link, router } from "expo-router";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = () =>{
      console.log("signup");
    }
  return (
   <KeyboardAvoidingView
   style={{flex:1}}
   behavior={Platform.OS === "ios" ? "padding" : "height"}
   >
   <View style={styles.container}>
   <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>PageMates📚</Text>
       <Text style={styles.subtitle}>Find and follow your reading buddies</Text>
    </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder='jeet banik'
              placeholderTextColor={COLORS.placeholderText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={COLORS.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder='example@gmail.com'
              placeholderTextColor={COLORS.placeholderText}
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize="none"            />
          </View>
        </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Enter your password'
                placeholderTextColor={COLORS.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={COLORS.primary}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        <TouchableOpacity style={styles.button} onPress={handleSignup}
            disabled={isLoading}>
            {
              isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign up</Text>
              )
            }
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            {/* <Link href="/" asChild> */}
            <TouchableOpacity onPress={ () => router.back()}>
              <Text style={styles.link}>login</Text>
            </TouchableOpacity>
            {/* </Link> */}
          </View>

      </View>
   </View>
   </View>
   </KeyboardAvoidingView>
  )
}
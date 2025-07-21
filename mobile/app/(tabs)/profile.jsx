import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Alert } from "react-native";
import React from "react";
import { useAuthStore } from "../../store/authStore.js";
import COLORS from "../../assets/constants/colors.js";
import styles from "../../assets/styles/profile.styles.js";
import { Ionicons } from "@expo/vector-icons";
import Loader from "../components/Loader.jsx";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function ProfileTab() {
  const { user, setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  if (!user) return <Loader />;

  
   const updateProfileImage = async (imageDataUrl) => {
    try {
      setLoading(true);

      const response = await fetch("http://192.168.0.100:3000/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newImage: imageDataUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update image");
      }

      setUser(data.user); // update user in store

      Alert.alert("Success", "Profile image updated");
    } catch (error) {
      console.log("Profile image update error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

   const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setUser({ ...user, profileImage: result.assets[0].uri });

        const asset = result.assets[0];
        let base64 = asset.base64;
        
        if (!base64) {
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
        const uriParts = asset.uri.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
        const imageDataUrl = `data:${imageType};base64,${base64}`;

        setImageBase64(imageDataUrl);
        await updateProfileImage(imageDataUrl);
      }
    } catch (error) {
      console.log("Image selection error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  console.log(user);
 

  if (!user) return <Loader/>;

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: user.profileImage[0].replace("svg", "png").trim() }} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.followers.length}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.followings.length}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user.likedPosts.length}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.editButton} onPress={() => console.log(" write the function to edit the bio and all")}>
        <Ionicons name="create-outline" size={18} color="white" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

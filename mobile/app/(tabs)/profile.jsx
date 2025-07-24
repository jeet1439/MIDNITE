import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Alert, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import React, { useCallback } from "react";
import { useAuthStore } from "../../store/authStore.js";
import COLORS from "../../assets/constants/colors.js";
import styles from "../../assets/styles/profile.styles.js";
import { Ionicons } from "@expo/vector-icons";
import Loader from "../components/Loader.jsx";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { formatPublishDate } from "../../lib/utils.js";

export default function ProfileTab() {
  const { user, setUser, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(true);

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

  // console.log(user);
  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("http://192.168.0.100:3000/api/posts/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }

      setPosts(data); // update post list
    } catch (error) {
      console.log("Fetch posts error:", error);
      Alert.alert("Error", "Could not load posts");
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts(); // always fetch latest posts from page 1
    }, [])
  );

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://192.168.0.100:3000/api/posts/like/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const isLiked = user.likedPosts?.includes(postId);

      const updatedLikedPosts = isLiked
        ? user.likedPosts.filter(id => id !== postId) // unlike
        : [...(user.likedPosts || []), postId];       // like

      setUser({
        ...user,
        likedPosts: updatedLikedPosts,
      });

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
              ...post,
              likes: isLiked
                ? post.likes.filter(id => id !== user._id)
                : [...post.likes, user._id]
            }
            : post
        )
      );

    } catch (err) {
      console.log("Like error", err);
    }
  };

  const renderItem = ({ item }) => (

    <View style={styles.postCard}>
      {/* Header: Avatar + Username + Follow */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user?.profileImage[0] }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
        <TouchableOpacity  disabled={loading} 
        onPress={() => console.log("Function to delete post")}>
        <Ionicons name="ellipsis-vertical" size={20} color="gray" />
      </TouchableOpacity>
      </View>

      {/* Main Image */}
      <View style={styles.postImageContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} contentFit="cover" />
      </View>

      {/* Like + View */}
      <View style={styles.postDetails}>
        <View style={styles.likeRow}>
          <View>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLike(item._id)}
            >
              {
                user?.likedPosts?.includes(item._id) ? (
                  <Ionicons
                    name={"heart"}
                    size={20}
                    color={"red"}
                  />
                ) :
                  (
                    <Ionicons
                      name={"heart-outline"}
                      size={20}
                      color={COLORS.textPrimary}
                    />
                  )
              }
              <Text>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.engagementText}>{item.views || 0} views</Text>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        {/* <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View> */}
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  if (!user) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
  <TouchableOpacity onPress={pickImage}>
    <Image
      source={{ uri: user.profileImage[0].replace("svg", "png").trim() }}
      style={styles.profileAvatar}
    />
  </TouchableOpacity>

  <View style={styles.details}>
    <View style={styles.flexrow}> 
    <Text style={styles.profileUsername}>{user.username}</Text>
    <TouchableOpacity onPress={() => console.log(" write the function to edit the bio and all")}>
    <Ionicons name="create-outline" size={18} color="gray" /></TouchableOpacity>
    </View>
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
  </View>
</View>
  <View style={styles.profileHeader}>
  <Text>🌍 Traveller | 💻 Software Developer
   Exploring the world one bug & border at a time 🌐✈️
📍 Always coding, always wandering</Text>
  </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPosts(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />
    </View>
  );
}

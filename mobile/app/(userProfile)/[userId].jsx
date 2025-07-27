import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Alert, FlatList, RefreshControl, ActivityIndicator, Linking } from "react-native";
import React, { useEffect, useState } from 'react';
import { useAuthStore } from "../../store/authStore.js";
import { useLocalSearchParams } from 'expo-router';
import { formatPublishDate } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../components/Loader';
import COLORS from "../../assets/constants/colors.js";
import styles from "../../assets/styles/profile.styles.js";

export default function UserProfile() {
  const { token, setUser, user } = useAuthStore();
  const { userId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [puser, setPUser] = useState(null);

  // console.log(user._id);

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://192.168.0.100:3000/api/user/${userId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
      setPUser(data);
    } catch (err) {
      console.error('Error fetching user:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://192.168.0.100:3000/api/posts/user/${userId}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
      fetchUser();
    }
  }, [userId]);

  const handleFollow = async (userId) => {
    try {
    const res = await fetch(`http://192.168.0.100:3000/api/user/follow/${userId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const isFollowing = user.followings.includes(userId);

    const updatedFollowings = isFollowing ? 
         user.followings.filter(id => id !== userId)
      :  [...user.followings, userId];    
          
     const updatedFollowers = isFollowing
      ? puser.followers.filter(id => id !== user._id)
      : [...puser.followers, user._id];

    setUser({
      ...user,
      followings: updatedFollowings,
    });

    setPUser({
      ...puser,
      followers: updatedFollowers,
    })

  } catch (err) {
    console.log("Follow error", err);
  }
  };

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

      const isLiked = puser.likedPosts?.includes(postId);

      const updatedLikedPosts = isLiked
        ? puser.likedPosts.filter(id => id !== postId)
        : [...(puser.likedPosts || []), postId];

      setPUser({
        ...puser,
        likedPosts: updatedLikedPosts,
      });

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: isLiked
                  ? post.likes.filter(id => id !== puser._id)
                  : [...post.likes, puser._id]
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
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: puser?.profileImage?.[0] }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{puser?.username || "Unknown"}</Text>
        </View>
      </View>

      <View style={styles.postImageContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} contentFit="cover" />
      </View>

      <View style={styles.postDetails}>
        <View style={styles.likeRow}>
          <View>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => handleLike(item._id)}
            >
              {puser?.likedPosts?.includes(item._id) ? (
                <Ionicons name="heart" size={20} color="red" />
              ) : (
                <Ionicons name="heart-outline" size={20} color={COLORS.textPrimary} />
              )}
              <Text>{item.likes?.length || 0}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.engagementText}>{item.views || 0} views</Text>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!puser ? (
        <Loader />
      ) : (
        <>
          <View style={styles.container}>
            <View style={styles.profileHeader}>
              <TouchableOpacity>
                <Image
                  source={{ uri: puser.profileImage[0].replace("svg", "png").trim() }}
                  style={styles.profileAvatar}
                />
              </TouchableOpacity>

              <View style={styles.details}>
                <View style={styles.flexrow}>
                  <Text style={styles.profileUsername}>{puser.username}</Text>
                </View>
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{puser.followers.length}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{puser.followings.length}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{puser.likedPosts.length}</Text>
                    <Text style={styles.statLabel}>Likes</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.profileHeader}>
              <Text style={styles.profileBio}>{puser?.bio || ""}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => handleFollow(userId)}>
                <Text style={styles.headerBtnText}>
                  {puser.followers.includes(user._id) ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() =>
                  Linking.openURL(
                    `mailto:${puser.email}?subject=Inquiry%20from%20your%20profile&body=Hi%20${puser.username},%0D%0A%0D%0AI%20just%20saw%20your%20profile%20and%20wanted%20to%20get%20in%20touch.%0D%0A%0D%0ALet%20me%20know%20when%20you%20are%20available.%0D%0A%0D%0ABest%20regards,`
                  )
                }
              >
                <Text style={styles.headerBtnText}>Contact</Text>
              </TouchableOpacity>
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
                  onRefresh={() => fetchPosts()}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              onEndReachedThreshold={0.1}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>Not posted yet</Text>
                </View>
              }
            />
          </View>
        </>
      )}
    </View>
  );
}

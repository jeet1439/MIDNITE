import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, Alert, FlatList, RefreshControl, ActivityIndicator, Linking, ScrollView, TextInput } from "react-native";
import React, { useEffect, useState } from 'react';
import { useAuthStore } from "../../store/authStore.js";
import { useLocalSearchParams } from 'expo-router';
import { formatPublishDate } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../components/Loader';
import COLORS from "../../assets/constants/colors.js";
import styles from "../../assets/styles/profile.styles.js";
import { BASE_URL } from "../../assets/constants/baseApi.js";
import Modal from 'react-native-modal';

export default function UserProfile() {
  const { token, setUser, user } = useAuthStore();
  const { userId } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [puser, setPUser] = useState(null);


  const [visible, setVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // console.log(user._id);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/user/${userId}`);
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
      const response = await fetch(`${BASE_URL}/api/posts/user/${userId}/posts`);
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
      const res = await fetch(`${BASE_URL}/api/user/follow/${userId}`, {
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
        : [...user.followings, userId];

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
      const res = await fetch(`${BASE_URL}/api/posts/like/${postId}`, {
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

  const handleComment = async (postId) => {
    if (!comment.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          text: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      // console.log('Comment added:', data);

      setComment('');
      setComments(prev => [data, ...prev]);;

    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }

  const getComments = async (postId) => {
    setVisible(true);
    setSelectedPostId(postId);

    try {
      setLoadingComments(true);
      const response = await fetch(`${BASE_URL}/api/comments/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      // console.log(data);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
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
          <View style={styles.flexRow}>
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
            <TouchableOpacity onPress={() => {
              getComments(item._id);
            }} >
              <Ionicons name="chatbox-outline" size={23} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.engagementText}>{item.views || 0} views</Text>
        </View>
        <Modal
          isVisible={visible}
          onBackdropPress={() => setVisible(false)}
          onBackButtonPress={() => setVisible(false)}
          style={{ margin: 0 }}
          hideModalContentWhileAnimating
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.row}>
                <TextInput
                  placeholder="Write a comment..."
                  style={styles.input}
                  value={comment}
                  onChangeText={setComment}
                />
                <TouchableOpacity onPress={() => handleComment(selectedPostId)} style={styles.iconButton}>
                  <Ionicons name="send-outline" size={24} color="#2c74c2ff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.iconButton}>
                  <Ionicons name="close-outline" size={24} color="#555" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
                {loadingComments ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : comments.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: COLORS.textSecondary }}>No comments yet.</Text>
                ) : (
                  comments.map((commentItem) => (
                    <View key={commentItem._id} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: commentItem.userId?.profileImage[0] }}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            marginRight: 8,
                          }}
                        />
                        <Text style={{ fontWeight: 'bold' }}>{commentItem.userId?.username}</Text>
                        <Text>    {formatPublishDate(commentItem.createdAt)}</Text>
                      </View>
                      <Text style={{ marginLeft: 38, color: COLORS.textPrimary }}>{commentItem.text}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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

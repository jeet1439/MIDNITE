import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import chatStyles from "../../assets/styles/chat.styles.js";
import COLORS from "../../assets/constants/colors.js";
import { useAuthStore } from "../../store/authStore.js";
import { useChatStore } from "../../store/chatStore.js";

const formatThreadTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

export default function ChatsTab() {
  const { token } = useAuthStore();
  const {
    conversations,
    fetchConversations,
    connectSocket,
    deleteConversation,
    loadingConversations,
  } = useChatStore();

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return;
      }

      connectSocket(token);
      fetchConversations(token).catch((error) => {
        Alert.alert("Chat error", error.message);
      });
    }, [connectSocket, fetchConversations, token])
  );

  const handleDeleteConversation = (conversationId) => {
    Alert.alert("Delete chat", "This will permanently remove the full conversation.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteConversation(token, conversationId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={chatStyles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/chat/[conversationId]",
          params: {
            conversationId: item._id,
            participantId: item.participant?._id,
            participantName: item.participant?.username,
            participantAvatar: item.participant?.profileImage?.[0] || "",
          },
        })
      }
      onLongPress={() => handleDeleteConversation(item._id)}
    >
      <Image source={{ uri: item.participant?.profileImage?.[0] }} style={chatStyles.avatar} />
      <View style={chatStyles.cardBody}>
        <View style={chatStyles.cardHeader}>
          <Text style={chatStyles.username} numberOfLines={1}>
            {item.participant?.username || "Unknown user"}
          </Text>
          <Text style={chatStyles.muted}>{formatThreadTime(item.updatedAt)}</Text>
        </View>
        <Text style={chatStyles.preview} numberOfLines={1}>
          {item.lastMessage?.text || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={chatStyles.screen}>
      <View style={chatStyles.header}>
        <Text style={chatStyles.title}>Chats</Text>
        <Text style={chatStyles.subtitle}>
          Long-press any conversation to delete it from Mongo.
        </Text>
      </View>

      {loadingConversations ? (
        <View style={chatStyles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={chatStyles.listContent}
          ListEmptyComponent={
            <View style={chatStyles.center}>
              <Ionicons name="chatbubbles-outline" size={54} color={COLORS.textSecondary} />
              <Text style={chatStyles.emptyTitle}>No conversations yet</Text>
              <Text style={chatStyles.emptySubtitle}>
                Start a chat from a profile, follower, or following list.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

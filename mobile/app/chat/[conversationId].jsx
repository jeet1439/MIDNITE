import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import chatStyles from "../../assets/styles/chat.styles.js";
import COLORS from "../../assets/constants/colors.js";
import { useAuthStore } from "../../store/authStore.js";
import { useChatStore } from "../../store/chatStore.js";

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function ChatThreadScreen() {
  const params = useLocalSearchParams();
  const initialConversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const participantId = Array.isArray(params.participantId)
    ? params.participantId[0]
    : params.participantId;
  const participantName = Array.isArray(params.participantName)
    ? params.participantName[0]
    : params.participantName;
  const participantAvatar = Array.isArray(params.participantAvatar)
    ? params.participantAvatar[0]
    : params.participantAvatar;

  const { token, user } = useAuthStore();
  const {
    messagesByConversation,
    loadingMessages,
    connectSocket,
    ensureConversation,
    fetchMessages,
    sendMessage,
    deleteMessage,
  } = useChatStore();
  const [resolvedConversationId, setResolvedConversationId] = useState(
    initialConversationId === "new" ? "" : initialConversationId
  );
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    connectSocket(token);
  }, [connectSocket, token]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!token || !participantId) {
        return;
      }

      try {
        let conversationId = initialConversationId;

        if (conversationId === "new" || !conversationId) {
          const conversation = await ensureConversation(token, participantId);
          conversationId = conversation._id;
          setResolvedConversationId(conversation._id);
        } else {
          setResolvedConversationId(conversationId);
        }

        await fetchMessages(token, conversationId);
      } catch (error) {
        Alert.alert("Chat error", error.message, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    };

    loadConversation();
  }, [ensureConversation, fetchMessages, token, participantId, initialConversationId]);

  const messages = useMemo(
    () => messagesByConversation[resolvedConversationId] || [],
    [messagesByConversation, resolvedConversationId]
  );

  useEffect(() => {
    if (messages.length) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      const payload = await sendMessage(token, participantId, text.trim());
      setResolvedConversationId(payload.conversation._id);
      setText("");
    } catch (error) {
      Alert.alert("Send failed", error.message);
    }
  };

  const handleDeleteMessage = (messageId) => {
    Alert.alert("Delete message", "This message will be removed for both participants.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMessage(token, messageId);
          } catch (error) {
            Alert.alert("Delete failed", error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isMine = item.sender?._id === user?._id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => handleDeleteMessage(item._id)}
        style={[chatStyles.bubble, isMine ? chatStyles.bubbleMine : chatStyles.bubbleOther]}
      >
        <Text style={isMine ? chatStyles.bubbleTextMine : chatStyles.bubbleTextOther}>
          {item.text}
        </Text>
        <Text style={isMine ? chatStyles.metaMine : chatStyles.metaOther}>
          {isMine ? "You" : item.sender?.username} - {formatMessageTime(item.createdAt)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={chatStyles.threadHeader}>
        <TouchableOpacity style={chatStyles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
        <Image source={{ uri: participantAvatar }} style={chatStyles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={chatStyles.username}>{participantName || "Chat"}</Text>
          <Text style={chatStyles.muted}>Encrypted in Mongo and synced live</Text>
        </View>
      </View>

      {loadingMessages && !messages.length ? (
        <View style={chatStyles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={chatStyles.threadMessages}
          ListEmptyComponent={
            <View style={chatStyles.center}>
              <Ionicons name="lock-closed-outline" size={48} color={COLORS.textSecondary} />
              <Text style={chatStyles.emptyTitle}>Start the conversation</Text>
              <Text style={chatStyles.emptySubtitle}>
                Your messages are end-to-end encrypted and stored securely in MongoDB.
              </Text>
            </View>
          }
        />
      )}

      <View style={chatStyles.composer}>
        <TextInput
          style={chatStyles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write an encrypted message..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
        />
        <TouchableOpacity style={chatStyles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

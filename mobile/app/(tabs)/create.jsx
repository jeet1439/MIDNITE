import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore.js";
import { BASE_URL } from "../../assets/constants/baseApi.js";

const COLORS = {
  primary: "#1976D2",
  textPrimary: "#1a4971",
  textSecondary: "#6d93b8",
  textDark: "#0d2b43",
  placeholderText: "#767676",
  background: "#e3f2fd",
  cardBackground: "#f5f9ff",
  inputBackground: "#f0f8ff",
  border: "#bbdefb",
  white: "#ffffff",
  black: "#000000",
};

const CreatePostScreen = () => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need access to your gallery to post photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5], // Optimized for social media feeds
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImage(asset.uri);
        setImageBase64(asset.base64);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64) {
      Alert.alert("Missing Info", "Please add a title, caption, and an image.");
      return;
    }

    try {
      setLoading(true);
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          image: imageDataUrl,
          genres: ["Action"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Alert.alert("Success", "Your post is live!");
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !title || !caption || !image || loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.shareBtn, isDisabled && styles.shareBtnDisabled]}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.shareBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Picker Section */}
        <View style={styles.imageCard}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.image} />
                <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={16} color={COLORS.white} />
                </View>
              </>
            ) : (
              <View style={styles.placeholder}>
                <View style={styles.iconCircle}>
                  <Ionicons name="camera" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.placeholderTitle}>Attach a photo</Text>
                <Text style={styles.placeholderSub}>Tap to browse gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Input Section */}
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your post a catchy title..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={COLORS.placeholderText}
          />

          <Text style={styles.label}>Caption</Text>
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="What's on your mind? #creative"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={5}
              placeholderTextColor={COLORS.placeholderText}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  backButton: {
    padding: 4,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
  },
  shareBtnDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  shareBtnText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageCard: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  imageWrapper: {
    width: "100%",
    height: 380,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editBadge: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  placeholder: {
    alignItems: "center",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  placeholderSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  titleInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  captionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
  },
  captionInput: {
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlignVertical: "top",
  },
});
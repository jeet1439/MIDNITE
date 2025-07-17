import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import styles from '../../assets/styles/create.styles.js'
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore.js';
import { API_URL } from '../../assets/constants/api.js';

const CreatePostScreen = () => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      if(Platform.OS !== "web"){
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if(status !== "granted"){
        Alert.alert("Permission denied");
        return;
      }
     }
     const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
     })
     if(!result.canceled){
      setImage(result.assets[0].uri);
      if(result.assets[0].base64){
        setImageBase64(result.assets[0].base64);
      }else{
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageBase64(base64);
      }
     }
    } catch (error) {
     console.log(error);
    }
  };

  const handleRating = (val) => setRating(val);

  const handleSubmit = async () => {
    if(!title || !caption || !imageBase64 || !rating){
      Alert.alert("Error", "Please fill all the fields");
      return;
    }
    try {
      setLoading(true);
      // const token = await AsyncStorage.getItem("token");
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      console.log(token);
      const res  = await fetch(`http://192.168.0.3:3000/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating,
          image: imageDataUrl,
          genres: ["Action"],
        }),
      })
      const data = await res.json();
      if(!res.ok){
        throw new Error(data.message || "Something went wrong");
      }
      Alert.alert("Success", "Posted successfully");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.log("error creating the post", error);
      Alert.alert("Error", error.message || "Someting went wrong");
    }finally{
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    >
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
          <Text style={styles.subtitle}>Share your experience</Text>
        </View>

        <View style={styles.form}>
          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="book-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Caption Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write your caption here..."
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          {/* Rating */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleRating(num)}
                  style={styles.starButton}
                >
                  <FontAwesome
                    name={num <= rating ? 'star' : 'star-o'}
                    size={24}
                    color="#facc15"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <FontAwesome name="image" size={32} color="#aaa" />
                  <Text style={styles.placeholderText}>Tap to upload image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="send" size={16} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Shere</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

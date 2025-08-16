import { View, Text, FlatList, Image, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore.js"; // adjust path if needed
import { API_URL } from "../../assets/constants/api.js";
import COLORS from "../../assets/constants/colors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";
const Followings = () => {
  const { user, token } = useAuthStore();
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/flw/followings/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch followings");

      setFollowings(data.followings || []);
    } catch (err) {
      console.log("Followers fetch error:", err);
      Alert.alert("Error", "Could not load followings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, []);

  const renderItem = ({ item }) => (
  <View style={styles.followerCard}>
  <TouchableOpacity style={styles.flexRow} onPress={() => router.push(`/(userProfile)/${item._id}`)}>
    <Image
      source={{ uri: item?.profileImage?.[0] }}
      style={styles.avatar}
    />
    <Text style={styles.username}>{item.username}</Text>
   </TouchableOpacity>
    <TouchableOpacity
      style={styles.messageBtn}
      onPress={() => {
       
        console.log("Message pressed for:", item.username);
      }}
    >
     <Text style={styles.messageText}>Message</Text>
    </TouchableOpacity>
  </View>
);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e3f2fd" }}>
    <View>
    <Text style={styles.text}>Followings</Text>
      <FlatList
        data={followings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="people-outline" size={50} color={COLORS.textSecondary} />
            <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
              No followings yet
            </Text>
          </View>
        }
      />
    </View>
    </SafeAreaView>
  );
};

export default Followings;


const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text:{
    marginLeft: 25,
    fontSize: 20,
    fontWeight: "bold"
  },
  followerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#daeaf7ff",
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  messageBtn: {
  marginLeft: "auto",
  backgroundColor: "#1976D2",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 7,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},
messageText: {
  color: "#f1f7ffff",
  fontSize: 14,
  fontWeight: "600",
},
flexRow: {
  flexDirection: "row" ,
  justifyContent: "center",
  alignItems: "center"
}
});

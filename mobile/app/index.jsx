import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../store/authStore.js";
import { useEffect } from "react";
import styles from "../assets/styles/home.styles.js";
export default function Index() {

  const { user, token ,checkAuth, logout } = useAuthStore();
   
  useEffect(() => {
    checkAuth();
  }, [])

  // console.log(user, token);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.bookTitle}>Hey { user?.username}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <Link href="/(auth)/signup">Signup page</Link>
      <Link href="/(auth)">Login page</Link>
    </View>
  );
}

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from "../../assets/constants/colors.js"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {

  const insets = useSafeAreaInsets();

  return (
    <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      headerTitleStyle:{
        color: COLORS.textPrimary,
        fontWeight: "600",
      },
      headerShadowVisible: false,
      tabBarStyle:{
        backgroundColor: COLORS.cardBackground,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 5,
        height: 50 + insets.bottom,
      }
    }}
    >
      <Tabs.Screen 
      name="index" 
      options={{
        title: "Home",
        tabBarIcon: ({color, size}) => (<Ionicons
          name='home-outline'
          size={size}
          color={color}
        />)
        }}
      />
      <Tabs.Screen 
      name="create"
      options={{ 
        title: "Create Post" ,
        tabBarIcon: ({color, size}) => (<Ionicons
          name='add-circle-outline'
          size={size}
          color={color}
        />)
        }} />
      <Tabs.Screen 
      name="follwingPost"
      options={{ 
        title: "Following",
        tabBarIcon: ({color, size}) => (<Ionicons
          name='people-outline'
          size={size}
          color={color}
        />) 
        }} />
      <Tabs.Screen 
      name="profile" 
      options={{ 
        title: "My Profile",
        tabBarIcon: ({color, size}) => (<Ionicons
          name='person-outline'
          size={size}
          color={color}
        />)
        }}/>
        <Tabs.Screen 
      name="settings" 
      options={{ 
        title: "settings",
        tabBarIcon: ({color, size}) => (<Ionicons
          name='settings-outline'
          size={size}
          color={color}
        />)
        }}/>
    </Tabs>
  );
}

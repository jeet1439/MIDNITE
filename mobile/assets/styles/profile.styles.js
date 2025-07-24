import { StyleSheet } from "react-native";
import COLORS from "../constants/colors.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 20, // space between avatar and details
  },

  details: {
    flex: 1,
    justifyContent: "center",
  },

  profileUsername: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 5,
    marginLeft: 18,
  },
  flexrow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "space-between"
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },

  statBox: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },

  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 0,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "SpaceMono-Regular",
    letterSpacing: 0.5,
    color: COLORS.primary,
    marginBottom: 8,
  },
  postCard: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  username: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },

  postImageContainer: {
    width: "100%",
    aspectRatio: 1, // square like Instagram
    backgroundColor: COLORS.border,
  },

  postImage: {
    width: "100%",
    height: "100%",
  },

  postDetails: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#192131ff",
    marginBottom: 4,
  },

  ratingContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },

  caption: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 6,
  },

  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
  followButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  followButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  engagementText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    justifyContent: "space-between",
  },

  likeButton: {
    flexDirection: "row",
    marginRight: 10,
    padding: 4,
    gap: 5,
  },
});

export default styles;
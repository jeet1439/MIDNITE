import { StyleSheet } from "react-native";
import COLORS from "../constants/colors.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingLeft: 3,
    paddingRight: 16, 
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 45,
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
    color: COLORS.textDark,
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
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  //comment styles

   modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '60%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  iconButton: {
    paddingHorizontal: 6,
  },
});

export default styles;